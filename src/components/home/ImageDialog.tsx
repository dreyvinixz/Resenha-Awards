export function ImageDialog() {
  return (
    <dialog id="image-dialog" aria-label="Visualização da imagem">
      <button className="dialog-close" aria-label="Fechar visualização">
        {"×"}
      </button>
      <img id="dialog-image" alt="" />
      <p id="dialog-title">
      </p>
    </dialog>
  );
}
