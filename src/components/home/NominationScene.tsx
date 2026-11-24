export function NominationScene() {
  return (
    <section className="nomination-scene" id="indicados" aria-labelledby="nomination-title">
      <div className="scene2-backdrop" aria-hidden="true">
        <video className="scene2-video" muted playsInline preload="none" poster="/assets/cenario2/C%C3%BApula%20Dourada%20na%20Cidade%20Neon.png" data-src="/assets/cenario2/Tropical%20Cyberpunk%20Loop.webm" data-fallback="/assets/cenario2/Tropical%20Cyberpunk%20Loop.mp4">
        </video>
        <div className="scene2-visual">
          <img className="scene2-layer scene2-executive" src="assets/cenario2/Imagem%20do%20ChatGPT%2024%20de%20nov.%20de%202026,%2004_11_38-2.png" alt="" />
          <img className="scene2-layer scene2-tung" src="assets/cenario2/Imagem%20do%20ChatGPT%2024%20de%20nov.%20de%202026,%2004_11_40-5.png" alt="" />
          <img className="scene2-layer scene2-dog" src="assets/cenario2/Imagem%20do%20ChatGPT%2024%20de%20nov.%20de%202026,%2004_11_40-6.png" alt="" />
          <img className="scene2-layer scene2-host" src="assets/cenario2/Imagem%20do%20ChatGPT%2024%20de%20nov.%20de%202026,%2004_11_39-3.png" alt="" />
          <img className="scene2-layer scene2-banana" src="assets/cenario2/Imagem%20do%20ChatGPT%2024%20de%20nov.%20de%202026,%2004_11_39-4.png" alt="" />
        </div>
      </div>
      <div className="scene2-shade">
      </div>
      <div className="scene2-copy">
        <span className="scene2-kicker">
          {"// A PRÓXIMA HISTÓRIA COMEÇA COM VOCÊ"}
        </span>
        <h2 id="nomination-title">
          {"QUEM MERECE"}
          <br />
          <em>
            {"UMA INDICAÇÃO?"}
          </em>
        </h2>
        <p>
          {"Acontecimento, meme ou figura lendária: chegou a hora de registrar sua indicação."}
        </p>
        <a className="scene2-link" href="/indicacoes/">
          {"FAZER INDICAÇÃO "}
          <span aria-hidden="true">
            {/* @license lucide-static v1.78.0 - ISC */}
            <svg className="ui-icon lucide lucide-arrow-up-right" aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 7h10v10" />
              <path d="M7 17 17 7" />
            </svg>
          </span>
        </a>
        <small>
          {"INDIQUE ATÉ QUATRO PESSOAS EM JACK DO ANO"}
        </small>
      </div>
      <span className="scene2-id">
        {"RESENHA AWARDS // 2026"}
      </span>
    </section>
  );
}
