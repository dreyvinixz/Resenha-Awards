import { categoryGuides, categoryHeading } from '../../data/homeContent';

export function Categories() {
  return <section className="awards-preview section" id="categorias">
    <div className="section-marker"><span>03 / PREMIAÇÃO</span><span>RESENHA AWARDS 2026</span></div>
    <div className="section-heading"><span className="kicker">{categoryHeading.kicker}</span><h2>{categoryHeading.title}</h2><div className="heading-line"/><p>{categoryHeading.description}</p></div>
    <div className="guide-sequence"><div className="guide-viewport"><div className="guide-frame">
      {categoryGuides.map((guide, index) => <article className="guide-chapter" aria-labelledby={`guide-title-${index}`} hidden={index !== 0} key={index}>
        <div className="guide-art"><img src={guide.image} alt={guide.alt} loading="lazy"/><span className="guide-art-index" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span></div>
        <div className="guide-copy"><span className="guide-label">{guide.label}</span><h3 id={`guide-title-${index}`}>{guide.title}</h3><p className="guide-intro">{guide.intro}</p>
          <ol className="guide-category-list" start={guide.start}>{guide.categories.map((category, offset) => <li key={category.name}><span className="guide-category-number">{String(guide.start + offset).padStart(2, '0')}</span><div><h4>{category.name}</h4><p>{category.description}</p></div></li>)}</ol>
        </div>
      </article>)}
    </div><nav className="guide-navigation" aria-label="Guias das categorias"><span className="guide-progress-label">GUIA <strong id="guide-current">01</strong> / 05</span><div className="guide-progress" id="guide-progress"/><span className="guide-scroll-prompt">ROLE PARA AVANÇAR <svg className="scroll-hint-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 4v16"/><path d="m5 13 7 7 7-7"/></svg></span></nav></div></div>
  </section>;
}
