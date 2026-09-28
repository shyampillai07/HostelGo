import './Footer.css';

export default function Footer() {
  return (
    <footer className="cp-footer">

      <div className="cp-footer-hairline" />

      <div className="cp-footer-inner">

        {/* SECTION 1 */}
        <div className="cp-footer-section cp-footer-brand">
          <div className="cp-footer-brand-row">
            <img src="/vtu-crest.png" alt="VTU crest" className="cp-footer-crest" />
            <div>
              <h3>Visvesvaraya Technological University</h3>
              <span className="cp-footer-suborg">PG Centre, Mysuru</span>
            </div>
          </div>
          <p>Digital hostel management for students and hostel administration.</p>
        </div>


        {/* SECTION 2 */}
        <div className="cp-footer-section">
          <h3>Quick Links</h3>

          <div className="cp-footer-links">
            <a href="/#about">About</a>
            <a href="/#services">Services</a>
            <a href="mailto:pgmysore@vtu.ac.in">Support</a>
          </div>
        </div>


        {/* SECTION 3 */}
        <div className="cp-footer-section cp-footer-contact">
          <h3>Contact</h3>

          <a href="https://maps.google.com/?q=VTU+PG+Centre+Mysuru" target="_blank" rel="noreferrer">VTU PG Centre, Mysuru</a>
          <a href="tel:+918212570010">Phone: 08212570010</a>
          <a href="mailto:pgmysore@vtu.ac.in">Email: pgmysore@vtu.ac.in</a>
          <a href="https://vtu.ac.in" target="_blank" rel="noreferrer">vtu.ac.in</a>
        </div>

      </div>

      <div className="cp-footer-bottom">
        © {new Date().getFullYear()} HostelGo. All rights reserved. Developed by <a href="https://github.com/shyampillai07" target="_blank" rel="noreferrer">Shyam Pillai</a>
      </div>

    </footer>
  );
}