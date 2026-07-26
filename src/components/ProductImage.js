import React from "https://esm.sh/react@18";

export function ProductImage({ image }) {
  if (image.type === "photo") {
    return React.createElement("img", {
      className: "product-image",
      src: image.url,
      alt: "",
    });
  }

  return React.createElement("div", {
    className: "product-image",
    style: { backgroundColor: image.color },
  });
}
