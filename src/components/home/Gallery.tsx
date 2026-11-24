export function Gallery() {
  return (
    <section className="gallery section" id="galeria">
      <div className="section-marker">
        <span>
          {"03 / GALERIA"}
        </span>
        <span>
          {"REGISTROS DO UNIVERSO"}
        </span>
      </div>
      <div className="section-heading">
        <span className="kicker">
          {"// DIRETO DOS ARQUIVOS"}
        </span>
        <h2>
          {"GALERIA"}
        </h2>
        <div className="heading-line">
        </div>
      </div>
      <div className="gallery-grid">
        <button className="gallery-item wide" data-image="assets/cenario1/Retrato Neon Cyberpunk da Equipe (1).png" data-title="A equipe">
          <img src="assets/cenario1/Retrato%20Neon%20Cyberpunk%20da%20Equipe%20(1).png" alt="A equipe reunida" loading="lazy" />
          <span>
            {"01 / A EQUIPE "}
            <b>
              {/* @license lucide-static v1.78.0 - ISC */}
              <svg className="ui-icon lucide lucide-arrow-up-right" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 7h10v10" />
                <path d="M7 17 17 7" />
              </svg>
            </b>
          </span>
        </button>
        <button className="gallery-item" data-image="assets/cenario2/Retrato Neon na Cúpula Dourada.png" data-title="A cúpula">
          <img src="assets/cenario2/Retrato%20Neon%20na%20Cúpula%20Dourada.png" alt="Personagens na cúpula dourada" loading="lazy" />
          <span>
            {"02 / A CÚPULA "}
            <b>
              {/* @license lucide-static v1.78.0 - ISC */}
              <svg className="ui-icon lucide lucide-arrow-up-right" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 7h10v10" />
                <path d="M7 17 17 7" />
              </svg>
            </b>
          </span>
        </button>
        <button className="gallery-item" data-image="assets/cenario1/Imagem do ChatGPT 24 de nov. de 2026, 02_52_58-1.png" data-title="A cidade">
          <img src="assets/cenario1/Imagem%20do%20ChatGPT%2024%20de%20nov.%20de%202026,%2002_52_58-1.png" alt="Cidade iluminada por neon" loading="lazy" />
          <span>
            {"03 / A CIDADE "}
            <b>
              {/* @license lucide-static v1.78.0 - ISC */}
              <svg className="ui-icon lucide lucide-arrow-up-right" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 7h10v10" />
                <path d="M7 17 17 7" />
              </svg>
            </b>
          </span>
        </button>
      </div>
    </section>
  );
}
