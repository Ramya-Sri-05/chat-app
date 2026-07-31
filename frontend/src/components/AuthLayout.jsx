import React from 'react';
import { Link } from 'react-router-dom';

const AuthLayout = ({
  eyebrow,
  title,
  subtitle,
  description,
  features,
  children,
  footerText,
  footerLinkText,
  footerLinkTo,
  termsText,
}) => {
  return (
    <div className="auth-page">
      <div className="auth-shell">
        <aside className="auth-hero">
          <div className="auth-hero__brand">
            <div className="auth-hero__logo">✦</div>
            <div>
              <div className="auth-hero__name">Chatify</div>
              <div className="auth-hero__tag">Messaging workspace</div>
            </div>
          </div>

          <div className="auth-hero__content">
            <p className="auth-hero__eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p className="auth-hero__description">{description}</p>
          </div>

          <ul className="auth-hero__features">
            {features.map((feature) => (
              <li key={feature.label}>
                <span className="auth-hero__feature-icon">{feature.icon}</span>
                <span>{feature.label}</span>
              </li>
            ))}
          </ul>
        </aside>

        <div className="auth-panel">
          <div className="auth-card">
            <div className="auth-card__header">
              <span className="auth-card__eyebrow">{eyebrow}</span>
              <h2>{subtitle}</h2>
              <p className="auth-card__subtitle">{description}</p>
            </div>

            {children}

            {footerText && footerLinkText && footerLinkTo && (
              <p className="auth-card__footer">
                {footerText}{' '}
                <Link to={footerLinkTo}>{footerLinkText}</Link>
              </p>
            )}

            {termsText && <p className="auth-card__terms">{termsText}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
