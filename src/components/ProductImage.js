import React from "react";

const { useState } = React;

export function ProductImage({ images }) {
  const [index, setIndex] = useState(0);

  return React.createElement(
    "div",
    {
      className: "product-image",
      onMouseEnter: () => setIndex(1),
      onMouseLeave: () => setIndex(0),
      onClick: () => setIndex((current) => (current === 0 ? 1 : 0)),
    },
    images.map((src, i) =>
      React.createElement("img", {
        key: src,
        className: "product-image-photo",
        style: { opacity: i === index ? 1 : 0 },
        src,
        alt: "",
      })
    )
  );
}
