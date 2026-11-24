export function Header() {
  return (
    <header className="header">
      <a href="#inicio" className="brand" aria-label="Resenha Awards, início">
        <img src="assets/Logo%20Neon%20RESENHA%20AWARDS.png" alt="Resenha Awards 2026" />
      </a>
      <button className="menu-toggle" aria-expanded="false" aria-controls="navigation" aria-label="Abrir menu">
        <span>
        </span>
        <span>
        </span>
      </button>
      <nav id="navigation" className="nav" aria-label="Navegação principal">
        <a href="#personagens">
          {"Personagens"}
        </a>
        <a href="#categorias">
          {"Categorias"}
        </a>
        <a href="#indicados">
          {"Indicações"}
        </a>
        <a href="/votacao/">
          {"Votação"}
        </a>
      </nav>
    </header>
  );
}
