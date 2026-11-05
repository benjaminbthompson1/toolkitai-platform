const C = require('./company');

function privacyHtml() {
  return `
  <h1>Privacy Policy</h1>
  <p class="legal-meta">Effective ${C.effectiveDate}</p>
  <p>This Privacy Policy explains what ${C.legalName} ("${C.brand}", "we", "us") collects when you use tkitai.com, our apps (Sealwright and Scanline) and our games, and what we do with it. ${C.legalName} is a ${C.state} limited liability company. Questions: <a class="link" href="mailto:${C.email}">${C.email}</a>.</p>

  <h2>1. Information we collect</h2>
  <p><strong>Account information.</strong> When you create an account we collect your first and last name, email address, phone number and a password. Passwords are stored only as a salted, one-way hash; we cannot read them.</p>
  <p><strong>Content you provide.</strong> In <em>Sealwright</em>: the documents you upload for signature, the document title, the names and email addresses of the people you ask to sign, the signatures and initials they provide, and a timestamped audit trail of the signing. In <em>Scanline</em>: the scans and images you capture or upload, the text extracted from them, document titles, and any password you choose to protect a scan (stored as a hash).</p>
  <p><strong>People invited to sign.</strong> A person who receives a signing link does not need an account. We store the name, email address, signature, and signing time for that person as part of the document record.</p>
  <p><strong>Technical information.</strong> Like most web services, our servers and hosting infrastructure may log your IP address, browser type and request times for security and troubleshooting. We use one essential session cookie (see section 4).</p>

  <h2>2. How we use information</h2>
  <ul>
    <li>To provide the apps: sign you in, store and display your documents and scans, route signing requests, and produce completed documents.</li>
    <li>To send transactional email: welcome and account messages, password resets, signing requests and completed copies.</li>
    <li>To text-extract or summarize a scan when you ask for that feature in Scanline. Content you submit for this is sent to our AI provider (Anthropic) only to return the result.</li>
    <li>To email a scan, or send it for signature, when you ask Scanline to. Emailing sends the PDF to the single recipient you enter, from your name; "Send for signature" copies the scan into your Sealwright account and emails each signer you list.</li>
    <li>To keep the service secure, prevent abuse and fix problems.</li>
  </ul>
  <p>We do not sell your personal information, and we do not use your documents or scans for advertising.</p>

  <h2>3. Who we share it with</h2>
  <ul>
    <li><strong>Other parties to a document.</strong> People you invite to sign can see the document you send them and, once complete, receive a copy that includes the signers and audit trail.</li>
    <li><strong>Service providers</strong> that help us run the service: our hosting infrastructure, our email delivery provider (Resend) and, for the optional AI features in Scanline, Anthropic. They may process data only to provide their service to us.</li>
    <li><strong>Legal and safety.</strong> If required by law or to protect rights, safety or the security of the service.</li>
    <li><strong>Business transfer.</strong> If ${C.legalName} is involved in a merger or sale of assets, information may transfer to the successor, which will be bound by this policy.</li>
  </ul>

  <h2>4. Cookies and third-party resources</h2>
  <p>We set a single essential cookie that keeps you signed in. We do not use advertising or cross-site tracking cookies. Some pages load fonts or scripts from third-party content networks (for example Google Fonts and cdnjs); those providers may see your IP address when your browser requests the files.</p>

  <h2>5. Retention and deletion</h2>
  <p>We keep your account and content until you delete it or ask us to. You can delete individual documents inside the apps. To delete your account and associated data, email <a class="link" href="mailto:${C.email}">${C.email}</a> from the address on the account. Backups may retain copies for a limited time before they are overwritten. We may keep information we are required to keep by law.</p>

  <h2>6. Security</h2>
  <p>Data is encrypted in transit with HTTPS and passwords are hashed. No system is perfectly secure, so we cannot guarantee absolute security.</p>

  <h2>7. Your choices</h2>
  <p>You can view and update your name, email and phone number on your Profile page. You may ask us to access, correct or delete your information by emailing us. We do not sell or share personal information for advertising.</p>

  <h2>8. Children</h2>
  <p>Our services are not directed to children under 13 and we do not knowingly collect their personal information. If you believe a child has given us information, email us and we will delete it.</p>

  <h2>9. Games</h2>
  <p>Our games, including Shell Yeah! at shellyeah.tkitai.com, can be played without a ${C.brand} account. Shell Yeah! includes a global leaderboard: information you choose to submit to it, such as a display name and your scores, is stored and may be shown publicly to other players. If a game collects any other information, it will be described in that game's own notice. Prizes or promotions offered through a game may have their own official rules.</p>

  <h2>10. Changes</h2>
  <p>We may update this policy. The effective date above shows the latest version, and material changes will be posted on this page.</p>

  <h2>11. Contact</h2>
  <p>${C.legalName}, ${C.state}, USA &middot; <a class="link" href="mailto:${C.email}">${C.email}</a></p>`;
}

function termsHtml() {
  return `
  <h1>Terms of Service</h1>
  <p class="legal-meta">Effective ${C.effectiveDate}</p>
  <p>These Terms govern your use of tkitai.com and the apps and games offered by ${C.legalName} ("${C.brand}", "we", "us"), a ${C.state} limited liability company. By using the services you agree to these Terms and our <a class="link" href="/privacy">Privacy Policy</a>.</p>

  <h2>1. Accounts</h2>
  <p>You must provide accurate information and keep your password confidential. You are responsible for activity under your account. You must be at least 13 years old, and old enough in your location to enter a binding agreement to use the apps that create legal documents.</p>

  <h2>2. Acceptable use</h2>
  <p>Do not use the services to break the law, infringe others' rights, upload malware, attempt to access other users' data, interfere with the service, or send unsolicited or deceptive signing requests. We may suspend or remove accounts or content that violate these Terms.</p>

  <h2>3. Your content</h2>
  <p>You keep ownership of the documents and scans you upload. You give us a limited license to store, process and display them solely to operate the services for you and the people you direct them to. You are responsible for having the right to upload your content and to ask others to sign it.</p>

  <h2>4. Sealwright (electronic signatures)</h2>
  <p>Sealwright helps you collect electronic signatures and produces a sealed copy with an audit trail. We are a software provider, not a law firm. We do not provide legal advice, are not a party to your agreements, and do not guarantee that a particular document or signature is enforceable in every jurisdiction or for every document type. Some documents (for example wills or certain real-estate or family-law documents) may require other formalities. You are responsible for deciding whether electronic signature is appropriate.</p>

  <h2>5. Scanline (document scanning)</h2>
  <p>Scanline's text extraction and summaries are generated automatically and may contain errors. Check important results against the original document.</p>
  <p>When you email a scan or send it for signature, you are responsible for having the right to share it with the recipients you choose.</p>

  <h2>6. Games</h2>
  <p>Games such as Shell Yeah! are provided for entertainment. They may change, be updated or be discontinued at any time.</p>

  <h2>7. Our property</h2>
  <p>The services, the ${C.brand} name and logos, and our software and designs are owned by ${C.legalName} or its licensors. These Terms do not give you rights to them other than to use the services as offered.</p>

  <h2>8. Availability and changes</h2>
  <p>We work to keep the services running but they are provided "as is" and "as available", and we may modify or discontinue any feature. Keep your own copies of anything important.</p>

  <h2>9. Disclaimer of warranties</h2>
  <p>To the fullest extent permitted by law, we disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose and non-infringement.</p>

  <h2>10. Limitation of liability</h2>
  <p>To the fullest extent permitted by law, ${C.legalName} will not be liable for indirect, incidental, special, consequential or punitive damages, or for lost profits, data or goodwill, and our total liability for any claim relating to the services is limited to the greater of the amount you paid us in the 12 months before the claim or US$100. Some jurisdictions do not allow certain limits, so parts of this section may not apply to you.</p>

  <h2>11. Termination</h2>
  <p>You may stop using the services and ask us to delete your account at any time. We may suspend or terminate access if you violate these Terms or if needed to protect the service or other users.</p>

  <h2>12. Governing law</h2>
  <p>These Terms are governed by the laws of the State of ${C.state}, without regard to conflict-of-law rules. Courts located in ${C.state} will have exclusive jurisdiction, except where your local law requires otherwise.</p>

  <h2>13. Changes</h2>
  <p>We may update these Terms. The effective date shows the latest version; continued use after changes means you accept them.</p>

  <h2>14. Contact</h2>
  <p>${C.legalName}, ${C.state}, USA &middot; <a class="link" href="mailto:${C.email}">${C.email}</a></p>`;
}

module.exports = { privacyHtml, termsHtml };
