import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../App.css';

const CAMPUS_GALLERY_IMAGES = [
  { src: '/campus/campus-1.jpg', alt: 'VTU PG Centre Mysuru central courtyard view' },
  { src: '/campus/campus-2.jpg', alt: 'VTU PG Centre Mysuru entrance view' },
  { src: '/campus/campus-3.jpg', alt: 'VTU PG Centre Mysuru hostel block exterior' },
  { src: '/campus/campus-4.jpg', alt: 'VTU PG Centre Mysuru administrative block' },
  { src: '/campus/campus-5.jpg', alt: 'VTU PG Centre Mysuru library' },
];

function handleCampusImageError(event) {
  event.currentTarget.src = '/vtu-crest.png';
  event.currentTarget.classList.add('landing-hero-slide-image--fallback');
}

export default function LandingPage() {
  return (
    <>
      <Header />
      <div className="landing-page">
        <section className="landing-hero">
          <div className="landing-hero-slider" aria-hidden="true">
            {CAMPUS_GALLERY_IMAGES.map((image, index) => (
              <div className="landing-hero-slide" key={image.src} style={{ animationDelay: `${index * 5}s` }}>
                <img className="landing-hero-slide-image" src={image.src} alt="" loading="eager" onError={handleCampusImageError} />
              </div>
            ))}
          </div>
          <div className="landing-hero-content">
            <p className="landing-eyebrow">VTU PG CENTRE • MYSURU</p>
            <h1>HostelGo</h1>
            <h2>Digital Hostel Management System</h2>
            <p className="landing-description">
              A unified digital platform for hostel admissions, room allotment, fee payments, and secure campus access.
            </p>
            <div className="landing-actions">
              <Link to="/register" className="landing-primary-btn">Get Started</Link>
            </div>
          </div>
        </section>
        <div className="hero-services-divider" aria-hidden="true" />
        <section className="services-section" id="services">
          <div className="section-heading">
            <p className="landing-eyebrow">HOSTELGO</p>
            <h2>Hostel Services</h2>
          </div>
          <div className="services-grid">
            <article className="service-item"><span className="service-number">01</span><div><h3>Digital Pass</h3><p>Digital hostel identification with QR-based access.</p></div></article>
            <article className="service-item"><span className="service-number">02</span><div><h3>Room Allocation</h3><p>Smart room and bed assignment with live occupancy data.</p></div></article>
            <article className="service-item"><span className="service-number">03</span><div><h3>Payments</h3><p>Easy fee submission with verification and status updates.</p></div></article>
            <article className="service-item"><span className="service-number">04</span><div><h3>Maintenance</h3><p>Quick issue reporting with transparent resolution tracking.</p></div></article>
          </div>
        </section>
        <section className="landing-intro" id="about">
          <p className="landing-eyebrow">VTU PG CENTRE • MYSURU</p>
          <h2>Digital management for hostel<br />services.</h2>
          <p>HostelGo brings essential hostel services together in one accessible platform for students and hostel administrators.</p>
        </section>
      </div>
      <Footer />
    </>
  );
}