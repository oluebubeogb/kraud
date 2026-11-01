"""Generate Android/iOS app icons + splash from /brand (navy background, white mark)."""
import os, glob
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__))
BRAND = os.environ.get("KRAUD_BRAND", os.path.join(HERE, "brand"))
NAVY = (0, 36, 84, 255)
mark = Image.open(os.path.join(BRAND, "kraud-mark-1024-white.png")).convert("RGBA")
def tile(size, pad=0.22, bg=NAVY):
    im = Image.new("RGBA", (size, size), bg); m = int(size * (1 - 2 * pad)); im.alpha_composite(mark.resize((m, m), Image.LANCZOS), ((size - m) // 2,) * 2); return im
# Android
res = os.path.join(HERE, "android/app/src/main/res")
for d, s in {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}.items():
    p = os.path.join(res, f"mipmap-{d}"); os.makedirs(p, exist_ok=True)
    tile(s).convert("RGB").save(os.path.join(p, "ic_launcher.png")); tile(s).convert("RGB").save(os.path.join(p, "ic_launcher_round.png"))
    fg = Image.new("RGBA", (int(s * 2.25),) * 2, (0, 0, 0, 0)); m = int(fg.width * 0.42); fg.alpha_composite(mark.resize((m, m), Image.LANCZOS), ((fg.width - m) // 2,) * 2); fg.save(os.path.join(p, "ic_launcher_foreground.png"))
bgxml = os.path.join(res, "values/ic_launcher_background.xml")
open(bgxml, "w").write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#002454</color>\n</resources>\n')
for f in glob.glob(os.path.join(res, "drawable*/splash.png")):
    w, h = Image.open(f).size; im = Image.new("RGBA", (w, h), NAVY); m = int(min(w, h) * 0.3); im.alpha_composite(mark.resize((m, m), Image.LANCZOS), ((w - m) // 2, (h - m) // 2)); im.convert("RGB").save(f)
# iOS
ios = os.path.join(HERE, "ios/App/App/Assets.xcassets")
for f in glob.glob(os.path.join(ios, "AppIcon.appiconset/*.png")):
    s = Image.open(f).size[0]; tile(s).convert("RGB").save(f)
for f in glob.glob(os.path.join(ios, "Splash.imageset/*.png")):
    w, h = Image.open(f).size; im = Image.new("RGBA", (w, h), NAVY); m = int(min(w, h) * 0.25); im.alpha_composite(mark.resize((m, m), Image.LANCZOS), ((w - m) // 2, (h - m) // 2)); im.convert("RGB").save(f)
print("icons written")
