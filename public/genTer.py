"""
genTer.py — Territory Generation Script

Outputs:
  - territories.json  : region/territory metadata (names, offsets, centroids, UUIDs)
  - <region>_labels.png : flat-color label image per region, one per region
      Red channel = territory index (1-based), 0 = sea/background

Usage:
  python genTer.py <regions_json> <images_dir> <n_territories> [--output-dir .]

Example:
  python genTer.py regions.json ./images/ 5 --output-dir ./out

Requirements:
  pip install pillow numpy scipy

Label PNG format:
  Same dimensions as the source region PNG.
  rgb(0,0,0)   = sea / background
  rgb(N,0,0)   = territory N (1-based, N matches territories array index+1)
  Load with getImageData(), read pixel[0] (red channel) for territory index.

Territory UUIDs:
  UUIDs in territories.json are generated fresh each run with uuid4().
  After first run, manually replace them with the UUIDs from your database,
  then commit the JSON. The label PNGs are keyed to array position, not UUIDs,
  so they do not need to change.

Region grouping:
  Edit GROUPS below to pool regions in world-map space before splitting.
  Grouped regions share territory IDs across their combined landmass.
"""

import json
import argparse
import uuid
import numpy as np
from PIL import Image
from scipy.ndimage import label as ndlabel
from pathlib import Path


# ── Region grouping ───────────────────────────────────────────────────────────
GROUPS = {
    "misthalin_wilderness": ["misthalin", "wilderness"],
    "karamja_asgarnia":     ["karamja", "asgarnia"],
}
REGION_TO_GROUP = {r: g for g, rs in GROUPS.items() for r in rs}
# ─────────────────────────────────────────────────────────────────────────────


def get_land_mask(arr):
    """True where pixels are land. Supports RGBA (alpha) and RGB (brightness)."""
    if arr.shape[2] == 4:
        return arr[:, :, 3] > 128
    return arr.max(axis=2) > 20


def fps_lloyd(pts, n_seeds, iters=12):
    """Farthest-point sampling + Lloyd relaxation for equal-ish Voronoi cells."""
    n_seeds = min(n_seeds, len(pts))
    chosen = [pts[len(pts) // 2]]
    for _ in range(n_seeds - 1):
        d = np.array([min(np.sqrt(((p - c) ** 2).sum()) for c in chosen) for p in pts])
        chosen.append(pts[d.argmax()])
    seeds = np.array(chosen, dtype=float)
    for _ in range(iters):
        d = np.sqrt(((pts[:, None] - seeds[None, :]) ** 2).sum(axis=2))
        assign = d.argmin(axis=1)
        for i in range(n_seeds):
            m = pts[assign == i]
            if len(m):
                seeds[i] = m.mean(axis=0)
    d = np.sqrt(((pts[:, None] - seeds[None, :]) ** 2).sum(axis=2))
    return seeds, d.argmin(axis=1)


def assign_unassigned(land_mask, final_labels, territory_id):
    """Assign any unassigned land pixels to the nearest territory centroid."""
    unassigned = land_mask & (final_labels == 0)
    if not unassigned.any():
        return final_labels
    n = int(unassigned.sum())
    print(f"  Cleanup: assigning {n} unassigned pixel(s) to nearest territory")
    centroids = []
    for tid in range(1, territory_id):
        if (final_labels == tid).any():
            ys, xs = np.where(final_labels == tid)
            centroids.append((tid, float(ys.mean()), float(xs.mean())))
    if not centroids:
        return final_labels
    uy, ux = np.where(unassigned)
    for py, px in zip(uy, ux):
        best = min(centroids, key=lambda c: (c[1] - py) ** 2 + (c[2] - px) ** 2)
        final_labels[py, px] = best[0]
    return final_labels


def split_into_n(land_mask, n_territories):
    """
    Detect islands, distribute n_territories proportionally, split each via Lloyd-Voronoi.
    Returns a label array (same shape as land_mask), 1-based, 0=sea.
    """
    labeled, n_blobs = ndlabel(land_mask)
    blobs = []
    for i in range(1, n_blobs + 1):
        m = labeled == i
        size = int(m.sum())
        if size >= 2:
            ys, xs = np.where(m)
            blobs.append({"id": i, "size": size, "cx": int(xs.mean()), "cy": int(ys.mean())})
    blobs.sort(key=lambda b: -b["size"])

    if not blobs:
        return np.zeros(land_mask.shape, dtype=int)

    print(f"  {len(blobs)} island(s) detected:")
    for b in blobs:
        print(f"    blob {b['id']}: {b['size']}px  center=({b['cx']},{b['cy']})")

    final_labels = np.zeros(land_mask.shape, dtype=int)
    territory_id = 1
    remaining = n_territories
    total_land = sum(b["size"] for b in blobs)

    for bi, blob in enumerate(blobs):
        blobs_left = len(blobs) - bi
        if blobs_left == 1:
            splits = remaining
        else:
            proportion = blob["size"] / total_land
            splits = max(1, round(proportion * n_territories))
            splits = min(splits, remaining - (blobs_left - 1))
        splits = max(1, splits)

        print(f"    blob {blob['id']} ({blob['size']}px) → {splits} territory/territories")

        blob_mask = labeled == blob["id"]
        ys, xs = np.where(blob_mask)
        pts = np.column_stack([xs, ys])

        if splits == 1:
            final_labels[blob_mask] = territory_id
            territory_id += 1
        else:
            _, assign = fps_lloyd(pts, splits)
            for i in range(splits):
                for px, py in pts[assign == i]:
                    final_labels[py, px] = territory_id
                territory_id += 1

        remaining -= splits
        if remaining <= 0:
            break

    return assign_unassigned(land_mask, final_labels, territory_id)


def make_label_png(final_labels, h, w):
    """
    Build a label PNG from a label array.
    Red channel = territory index (1-based), 0 = sea.
    Green and blue channels are always 0.
    Max supported territories per region: 255.
    """
    if final_labels.max() > 255:
        raise ValueError(f"Too many territories ({final_labels.max()}) — max 255 per region")
    rgba = np.zeros((h, w, 4), dtype=np.uint8)
    rgba[:, :, 0] = final_labels.astype(np.uint8)  # red = territory index
    rgba[:, :, 3] = 255                              # fully opaque (required for getImageData)
    return Image.fromarray(rgba, "RGBA")


def build_territory_meta(name, filename, final_labels, ox, oy, h, w):
    """Build the metadata dict for one region's territories."""
    territory_ids = sorted(set(int(x) for x in final_labels[final_labels > 0].flatten()))
    territories = []
    for tid in territory_ids:
        m = final_labels == tid
        ys, xs = np.where(m)
        territories.append({
            "id": str(uuid.uuid4()),  # replace with DB UUID after first run
            "index": tid,             # matches red channel value in label PNG
            "name": f"Territory {tid}",  # replace with human-readable name in DB
            "size": int(m.sum()),
            "cx": int(xs.mean()),
            "cy": int(ys.mean()),
        })
    return {
        "name": name,
        "filename": filename,
        "label_filename": filename.replace(".png", "_labels.png"),
        "imageWidth": w,
        "imageHeight": h,
        "offsetX": ox,
        "offsetY": oy,
        "territories": territories,
    }


def load_image(path):
    img = Image.open(path)
    return np.array(img.convert("RGBA") if img.mode == "RGBA" else img.convert("RGB"))


def process_region(region_meta, images_dir, n_territories, output_dir):
    name = region_meta["name"]
    filename = region_meta["filename"]
    print(f"\nProcessing: {name}")

    arr = load_image(Path(images_dir) / filename)
    h, w = arr.shape[:2]
    land = get_land_mask(arr)
    final_labels = split_into_n(land, n_territories)

    label_img = make_label_png(final_labels, h, w)
    label_path = Path(output_dir) / filename.replace(".png", "_labels.png")
    label_img.save(label_path)
    print(f"  → saved {label_path.name}")

    return build_territory_meta(
        name, filename, final_labels,
        region_meta["offsetX"], region_meta["offsetY"], h, w
    )


def process_group(group_name, group_regions, images_dir, n_territories, map_w, map_h, output_dir):
    print(f"\nProcessing group: {group_name} ({[r['name'] for r in group_regions]})")

    world_land = np.zeros((map_h, map_w), dtype=bool)
    region_data = {}

    for r in group_regions:
        arr = load_image(Path(images_dir) / r["filename"])
        h, w = arr.shape[:2]
        land = get_land_mask(arr)
        ox, oy = r["offsetX"], r["offsetY"]
        x1, y1, x2, y2 = ox, oy, min(ox + w, map_w), min(oy + h, map_h)
        world_land[y1:y2, x1:x2] |= land[:y2 - y1, :x2 - x1]
        region_data[r["name"]] = {"arr": arr, "h": h, "w": w, "land": land, "ox": ox, "oy": oy}

    world_labels = split_into_n(world_land, n_territories)

    results = []
    for r in group_regions:
        rd = region_data[r["name"]]
        ox, oy, h, w = rd["ox"], rd["oy"], rd["h"], rd["w"]
        x1, y1, x2, y2 = ox, oy, min(ox + w, map_w), min(oy + h, map_h)

        local_labels = np.zeros((h, w), dtype=int)
        local_labels[:y2 - y1, :x2 - x1] = world_labels[y1:y2, x1:x2]
        local_labels[~rd["land"]] = 0
        local_labels = assign_unassigned(rd["land"], local_labels, int(local_labels.max()) + 1)

        label_img = make_label_png(local_labels, h, w)
        label_path = Path(output_dir) / r["filename"].replace(".png", "_labels.png")
        label_img.save(label_path)
        print(f"  {r['name']} → saved {label_path.name}")

        result = build_territory_meta(
            r["name"], r["filename"], local_labels,
            rd["ox"], rd["oy"], h, w
        )
        results.append(result)

    return results


def main():
    parser = argparse.ArgumentParser(description="Generate territory label PNGs for OSRS regions.")
    parser.add_argument("regions_json",   help="Path to regions.json")
    parser.add_argument("images_dir",     help="Directory containing region PNG files")
    parser.add_argument("n_territories",  type=int, help="Territories per region/group")
    parser.add_argument("--output-dir",   default=".", help="Directory to write output files")
    args = parser.parse_args()

    Path(args.output_dir).mkdir(parents=True, exist_ok=True)

    with open(args.regions_json) as f:
        config = json.load(f)

    map_w = config["mapWidth"]
    map_h = config["mapHeight"]
    regions = config["regions"]
    n = args.n_territories

    groups = {}
    standalone = []
    for r in regions:
        gname = REGION_TO_GROUP.get(r["name"])
        if gname:
            groups.setdefault(gname, []).append(r)
        else:
            standalone.append(r)

    results = []
    for r in standalone:
        results.append(process_region(r, args.images_dir, n, args.output_dir))
    for gname, group_regions in groups.items():
        results.extend(process_group(gname, group_regions, args.images_dir, n, map_w, map_h, args.output_dir))

    order = {r["name"]: i for i, r in enumerate(regions)}
    results.sort(key=lambda r: order.get(r["name"], 999))

    out_path = Path(args.output_dir) / "territories.json"
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)

    total = sum(len(r["territories"]) for r in results)
    print(f"\n✓ {len(results)} regions, {total} territories")
    print(f"  territories.json → {out_path}")
    print(f"  label PNGs       → {args.output_dir}/")
    print(f"\nNext step: replace 'id' values in territories.json with UUIDs from your database.")


if __name__ == "__main__":
    main()
