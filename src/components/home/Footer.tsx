export function Footer() {
  return (
    <footer>
      <a href="#inicio">
        <img src="assets/Logo%20Neon%20RESENHA%20AWARDS.png" alt="Resenha Awards 2026" />
      </a>
      <p>
        {"UMA NOITE. MUITAS HISTÓRIAS."}
        <br />
        <span>
          {"RESENHA AWARDS © 2026"}
        </span>
      </p>
      <a className="back-top" href="#inicio">
        {"VOLTAR AO TOPO "}
        {/* @license lucide-static v1.78.0 - ISC */}
        <svg className="ui-icon lucide lucide-arrow-up" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m5 12 7-7 7 7" />
          <path d="M12 19V5" />
        </svg>
      </a>
    </footer>
  );
}
