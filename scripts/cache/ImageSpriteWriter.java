import net.runelite.cache.definitions.SpriteDefinition;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Path;

/** Writes a cache sprite to a PNG, keeping its transparent pixels transparent. */
final class ImageSpriteWriter {
  private ImageSpriteWriter() {}

  static void write(SpriteDefinition sprite, Path out) throws IOException {
    BufferedImage image =
        new BufferedImage(sprite.getWidth(), sprite.getHeight(), BufferedImage.TYPE_INT_ARGB);
    image.setRGB(0, 0, sprite.getWidth(), sprite.getHeight(),
        sprite.getPixels(), 0, sprite.getWidth());
    ImageIO.write(image, "png", out.toFile());
  }
}
