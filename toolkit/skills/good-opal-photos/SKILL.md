---
name: good-opal-photos
description: Prepares Steph's opal photos for goodopalco.com by cropping, straightening by quarter turns, centring, padding to the shop's 4:5 frame and compressing, without changing a single stone colour. Use whenever Steph shares product photos to list or asks to tidy, crop or resize photos for the shop.
---

# Good Opal photos

Buyers pay for the colour they see, and many of Steph's listings tell buyers her photos are not edited. So this skill only changes the frame of a photo, never its colours.

## Allowed

- crop
- rotate in quarter turns (90, 180, 270 degrees)
- centre the piece
- pad the edges to the shop's 4:5 frame with the photo's own edge colour
- resize to at most 1600 x 2000 and save as JPEG

## Never

- change colour, white balance, exposure, brightness, contrast, saturation, vibrance, sharpness or clarity
- apply any filter, tint, overlay, blend mode, "enhance", "auto" or AI upscaling
- replace, blur, recolour or clean the background. Earlier background-replaced shots left a halo and a colour cast around the stone, so the shop went back to real photos.
- rotate by small angles. Resampling blends stone pixels. If a photo is badly tilted, ask Steph to retake it.
- remove the stone's real marks or inclusions

If Steph asks for any of these, explain kindly that the shop's photos must show the stone exactly as it is, and offer a crop instead.

## How to prepare a photo

Use `prepare_photo.py` in this skill folder. It needs Python with Pillow and numpy, which Claude's code tool has.

1. Look at the photo and work out the box around the piece (the whole ring or pendant, or the stone for loose opals) in the photo's own pixels: left, top, right, bottom. Check the size with Pillow first.
2. Run:

   ```
   python prepare_photo.py IN.jpg OUT.jpg --box LEFT,TOP,RIGHT,BOTTOM
   ```

   Add `--rotate 90` (counter-clockwise), `180` or `270` if the phone saved it sideways. Without `--box`, the script tries to find the piece against a plain background and tells you if it cannot.

3. The script frames the piece so it fills about 62% of the width or 52% of the height, which is how the shop's other lead photos sit. It crops inside the photo where it can and only pads when the photo is too small.
4. It then checks itself and prints a report:
   - `stone_pixels_copied_exactly` must be `true`: the pixels inside the box were copied without change before resizing
   - `stone_mean_drift` is how far the average colour in the box moved after resizing and JPEG saving, out of 255. It must be 2 or less.
   - `passed` must be `true`. If not, the script deletes the output. Do not work around it.
5. Show Steph each prepared photo beside its original and ask if the framing is right. Adjust the box if not.
6. Give her the files to download. Then call `photo_upload_link` with the draft's product id and give her the link: she picks the files, they go onto the end of that draft, and she tells you when they are in. With no product id the photos go into Media only.
7. Check them with `find_products` (by id), which shows each photo with its media id. Reorder with `update_product_draft` and `imageIds`, lead photo first.

For a photo on the home, about or services page, call `photo_upload_link` with no product id so it lands in Media, find it with `list_recent_media`, then set it with `update_site_content` after Steph agrees. That changes the live page straight away.

If her photos are already framed well, skip the preparing: she can upload the originals from her phone through the same link.

## Alt text

The upload link gives each photo plain alt text: the piece's name and a number. Better alt text describes what the photo shows, for example "Lightning Ridge black opal, face up, green and blue flashes". Suggest it to Steph; she can edit Alt on the photo in the admin. Describe what is visible; do not add claims.

## Lead photo

The first photo is the shop card and the share image. Choose the clearest, straight-on shot of the face of the stone in natural light.
