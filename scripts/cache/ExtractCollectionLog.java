import com.google.gson.*;
import net.runelite.cache.*;
import net.runelite.cache.definitions.*;
import net.runelite.cache.definitions.loaders.*;
import net.runelite.cache.definitions.providers.ModelProvider;
import net.runelite.cache.fs.*;
import net.runelite.cache.item.ItemSpriteFactory;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.*;
import java.nio.file.*;
import java.util.*;

/**
 * Extracts everything the /collection-log page needs straight out of the OSRS
 * game cache, so the site renders the same pixels the client does:
 *
 *   1. collection_log_catalog.json             - flat catalog rows for the
 *                                                backend to seed into the DB
 *   2. scripts/cache/.build/items/<id>.png     - item icons rendered from models
 *   3. public/collection-log/ui/*.png          - interface sprites (frame, tabs, ...)
 *
 * The item icons are NOT committed — there are ~1,700 of them. They go to S3 via
 * scripts/cache/upload-items.sh, which is where the site loads them from.
 *
 * Run via scripts/cache/extract.sh, which resolves the RuneLite cache library.
 */
public class ExtractCollectionLog {
  /** Collection log tab labels, from interface 621 components 4-8. */
  private static final String[] TABS = {"Bosses", "Raids", "Clues", "Minigames", "Other"};
  /** enum 2102 holds the tab labels; 2103-2107 map tab index -> page struct. */
  private static final int[] TAB_ENUMS = {2103, 2104, 2105, 2106, 2107};
  /** Page struct params: 689 = display name, 690 = enum of the page's item ids. */
  private static final int PARAM_PAGE_NAME = 689;
  private static final int PARAM_ITEM_ENUM = 690;

  /**
   * Interface sprites the collection log draws itself with, mapped to the file
   * names the React components import. Sprite ids come from the cc_setgraphic
   * calls in the CS2 scripts for interface group 621 (and the shared window
   * frame / scrollbar scripts they invoke).
   */
  private static final Map<Integer, String> UI_SPRITES = new LinkedHashMap<>();
  static {
    // Outer stone window frame: four corners, four tiling edges. Which strip is
    // top and which is bottom is settled by the bevel: every piece is dark on
    // its outer edge and light on its inner one, so 314 (dark row first) must
    // continue the top corners' horizontal arms and 173 (light row first) the
    // bottom ones.
    UI_SPRITES.put(310, "frame-tl");
    UI_SPRITES.put(311, "frame-tr");
    UI_SPRITES.put(312, "frame-bl");
    UI_SPRITES.put(313, "frame-br");
    UI_SPRITES.put(314, "frame-t");
    UI_SPRITES.put(173, "frame-b");
    UI_SPRITES.put(172, "frame-l");
    UI_SPRITES.put(315, "frame-r");
    // Panel background. Interface group 285 (the shared window frame) fills the
    // window with 88x60 tiles of sprite 297 before drawing the frame on top.
    UI_SPRITES.put(297, "bg");
    // The darker tile the client fills sunken boxes with (script 2978 pairs it
    // with the 921-928 bevel); used here as the search field's well.
    UI_SPRITES.put(897, "bg-inset");
    // Tabs: "active" pieces have no bottom edge so they merge into the panel.
    UI_SPRITES.put(2283, "tab-active-cap");
    UI_SPRITES.put(2284, "tab-active-mid");
    UI_SPRITES.put(2285, "tab-cap");
    UI_SPRITES.put(2286, "tab-mid");
    // Search field icon, and the 21x21 "?" button (2521 raised, 2522 pressed).
    UI_SPRITES.put(1043, "icon-search");
    UI_SPRITES.put(2521, "btn-info");
    UI_SPRITES.put(2522, "btn-info-pressed");
    // Scrollbar: arrow buttons, three-piece thumb, tiling track.
    UI_SPRITES.put(773, "scroll-up");
    UI_SPRITES.put(788, "scroll-down");
    UI_SPRITES.put(789, "scroll-thumb-top");
    UI_SPRITES.put(790, "scroll-thumb-mid");
    UI_SPRITES.put(791, "scroll-thumb-bottom");
    UI_SPRITES.put(792, "scroll-track");
    // Vertical divider between the page list and the item grid.
    UI_SPRITES.put(1123, "divider-l");
    UI_SPRITES.put(1124, "divider-m");
    UI_SPRITES.put(1125, "divider-r");
  }

  public static void main(String[] args) throws Exception {
    if (args.length < 2) {
      System.err.println("usage: ExtractCollectionLog <cacheDir> <repoRoot> [catalogOut]");
      System.exit(2);
    }
    Path cacheDir = Paths.get(args[0]);
    Path repo = Paths.get(args[1]);
    // Written to the backend's seed data: the catalog lives in the database
    // (collection_log_items), and both the website and stabiliserver read it
    // from there. args[2] overrides the location.
    Path catalogFile = args.length > 2
        ? Paths.get(args[2])
        : repo.resolve("scripts/cache/.build/collection_log_catalog.json");
    Path itemDir = repo.resolve("scripts/cache/.build/items");
    Path uiDir = repo.resolve("public/collection-log/ui");
    Files.createDirectories(catalogFile.getParent());
    Files.createDirectories(itemDir);
    Files.createDirectories(uiDir);

    try (Store store = new Store(cacheDir.toFile())) {
      store.load();

      Map<Integer, EnumDefinition> enums = loadEnums(store);
      Map<Integer, StructDefinition> structs = loadStructs(store);
      ItemManager itemManager = new ItemManager(store);
      itemManager.load();
      Map<Integer, ItemDefinition> items = new HashMap<>();
      for (ItemDefinition d : itemManager.getItems()) if (d != null) items.put(d.id, d);

      // ---- 1. catalog ----
      // Flat placements, the shape scripts/seed_collection_log.py inserts into
      // collection_log_items. One row per (item, page): an item can sit on
      // several pages (shared clue rewards, pets that also appear under
      // "All Pets"), which is why (item_id, page) is the natural key.
      JsonArray catalog = new JsonArray();
      Set<Integer> usedItems = new TreeSet<>();
      // page_order runs across every tab, not per tab: /collection-log/catalog
      // orders by (page_order, sequence) alone, so this is what keeps the tabs
      // themselves in in-game order too.
      int pageOrder = 0;
      int pageCount = 0;
      for (int tab = 0; tab < TAB_ENUMS.length; tab++) {
        for (int[] entry : intPairs(enums.get(TAB_ENUMS[tab]))) {
          StructDefinition st = structs.get(entry[1]);
          if (st == null || st.getParams() == null) continue;
          Object name = st.getParams().get(PARAM_PAGE_NAME);
          Object itemEnum = st.getParams().get(PARAM_ITEM_ENUM);
          if (!(name instanceof String) || !(itemEnum instanceof Integer)) continue;
          int sequence = 0;
          for (int[] kv : intPairs(enums.get((Integer) itemEnum))) {
            ItemDefinition item = items.get(kv[1]);
            if (item == null) continue;
            JsonObject row = new JsonObject();
            row.addProperty("item_id", kv[1]);
            row.addProperty("name", item.name);
            row.addProperty("category", TABS[tab]);
            row.addProperty("page", (String) name);
            row.addProperty("page_order", pageOrder);
            row.addProperty("sequence", sequence);
            catalog.add(row);
            usedItems.add(kv[1]);
            sequence++;
          }
          pageOrder++;
          pageCount++;
        }
      }
      try (Writer w = Files.newBufferedWriter(catalogFile)) {
        new GsonBuilder().create().toJson(catalog, w);
      }
      System.out.printf("catalog: %d pages, %d placements, %d unique items -> %s%n",
          pageCount, catalog.size(), usedItems.size(), catalogFile);

      // ---- 2. item icons ----
      SpriteManager spriteManager = new SpriteManager(store);
      spriteManager.load();
      TextureManager textureManager = new TextureManager(store);
      textureManager.load();
      Index modelIndex = store.getIndex(IndexType.MODELS);
      ModelProvider modelProvider = modelId -> {
        Archive archive = modelIndex.getArchive(modelId);
        if (archive == null) return null;
        byte[] data = archive.decompress(store.getStorage().loadArchive(archive));
        return new ModelLoader().load(modelId, data);
      };
      int rendered = 0, failed = 0;
      for (int id : usedItems) {
        try {
          BufferedImage img = ItemSpriteFactory.createSprite(
              itemManager, modelProvider, spriteManager, textureManager,
              id, /* quantity */ 1, /* border */ 1, /* shadowColor */ 0, /* noted */ false);
          if (img == null) { failed++; continue; }
          ImageIO.write(img, "png", itemDir.resolve(id + ".png").toFile());
          rendered++;
        } catch (Exception | StackOverflowError e) {
          failed++;
          System.err.println("item " + id + " failed: " + e);
        }
      }
      System.out.printf("items: %d rendered, %d failed -> %s%n", rendered, failed, itemDir);

      // ---- 3. interface sprites ----
      for (Map.Entry<Integer, String> e : UI_SPRITES.entrySet()) {
        SpriteDefinition sprite = spriteManager.findSprite(e.getKey(), 0);
        if (sprite == null) {
          System.err.println("missing sprite " + e.getKey() + " (" + e.getValue() + ")");
          continue;
        }
        ImageSpriteWriter.write(sprite, uiDir.resolve(e.getValue() + ".png"));
      }
      System.out.printf("ui: %d sprites -> %s%n", UI_SPRITES.size(), uiDir);
    }
  }

  private static Map<Integer, EnumDefinition> loadEnums(Store store) throws IOException {
    Map<Integer, EnumDefinition> out = new HashMap<>();
    Archive archive = store.getIndex(IndexType.CONFIGS).getArchive(ConfigType.ENUM.getId());
    for (FSFile f : archive.getFiles(store.getStorage().loadArchive(archive)).getFiles())
      out.put(f.getFileId(), new EnumLoader().load(f.getFileId(), f.getContents()));
    return out;
  }

  private static Map<Integer, StructDefinition> loadStructs(Store store) throws IOException {
    Map<Integer, StructDefinition> out = new HashMap<>();
    Archive archive = store.getIndex(IndexType.CONFIGS).getArchive(ConfigType.STRUCT.getId());
    for (FSFile f : archive.getFiles(store.getStorage().loadArchive(archive)).getFiles())
      out.put(f.getFileId(), new StructLoader().load(f.getFileId(), f.getContents()));
    return out;
  }

  /** Enum entries as {key, intValue} pairs, ordered by key (= in-game order). */
  private static List<int[]> intPairs(EnumDefinition def) {
    List<int[]> out = new ArrayList<>();
    if (def == null || def.getKeys() == null || def.getIntVals() == null) return out;
    for (int i = 0; i < def.getKeys().length && i < def.getIntVals().length; i++)
      out.add(new int[]{def.getKeys()[i], def.getIntVals()[i]});
    out.sort(Comparator.comparingInt(pair -> pair[0]));
    return out;
  }
}
