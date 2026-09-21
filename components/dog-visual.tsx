"use client";

import { useEffect, useRef, useState } from "react";

export function DogVisual({
  name,
  image,
  profile = false
}: {
  name: string;
  image: string;
  profile?: boolean;
}) {
  const [hasImage, setHasImage] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const imageElement = imageRef.current;
    if (imageElement?.complete && imageElement.naturalWidth > 0) setHasImage(true);
  }, [image]);

  return (
    <>
      <img
        ref={imageRef}
        className={`${profile ? "uploaded-photo" : "uploaded-card-photo"} ${hasImage ? "is-loaded" : ""}`}
        src={image}
        alt={`${name}, a dog from the IIM Udaipur campus`}
        onLoad={() => setHasImage(true)}
        onError={() => setHasImage(false)}
      />
      <div className={`${profile ? "photo-placeholder" : "dog-avatar"} ${hasImage ? "is-hidden" : ""}`} aria-hidden="true">
        <span>{name.slice(0, 1)}</span>
        {profile && <small>Add {name}.jpg to public/dogs</small>}
        {!profile && (
          <>
            <div className="avatar-ear avatar-ear-left" />
            <div className="avatar-ear avatar-ear-right" />
            <div className="avatar-muzzle" />
          </>
        )}
      </div>
    </>
  );
}
