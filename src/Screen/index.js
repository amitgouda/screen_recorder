import React from "react";
import "./style.css"
export default function Screen({ name, handleOnClick, id }) {
  return <div className="container" onClick={() => handleOnClick(id)}>{name}</div>;
}
