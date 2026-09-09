"use client";

import { useState } from "react";

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

  return (
    <>
      <img
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
