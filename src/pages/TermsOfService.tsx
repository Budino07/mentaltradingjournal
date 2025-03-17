
import React from "react";
import { Footer } from "@/components/landing/Footer";
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <div className="min-h-screen relative bg-[#1A1F2C] overflow-x-hidden">
      {/* Background effects - similar to other pages for consistency */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[#1A1F2C]" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent opacity-30" />
        <div className="absolute inset-0">
          <div className="absolute top-0 -left-40 w-80 h-80 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute top-0 -right-40 w-80 h-80 bg-accent/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.02]" />
        <div className="absolute inset-0 backdrop-blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/5 backdrop-blur-md border-b border-white/5">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-primary-light to-accent bg-clip-text text-transparent">
                Mental
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                to="/"
                className="text-white/70 hover:text-white hover:bg-white/5 px-2 sm:px-4 py-2 rounded transition-colors"
              >
                Home
              </Link>
            </div>
          </div>
        </header>

        <section className="pt-32 pb-16">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-8 lg:p-10 shadow-xl">
              <div className="flex items-center mb-6 space-x-3">
                <div className="bg-primary/20 p-3 rounded-lg">
                  <FileText className="h-6 w-6 text-primary-light" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Terms of Service</h1>
              </div>
              
              <div className="text-sm md:text-base text-gray-200 space-y-6">
                <p className="text-gray-400">Effective Date: March 15th 2025</p>
                
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">1. User's Acknowledgment and Acceptance of Terms</h2>
                  <p>
                    By using the Mental Trading Journal website and any related services (collectively, the "Site"), you agree to comply with the following Terms of Service ("Terms"), as well as any other written agreements between you and Mental Trading Journal (referred to as "We," "Us," or "Our"). We reserve the right to modify or discontinue the Site or any of its features at any time, with or without notice to you. You are responsible for regularly reviewing these Terms, and your continued use of the Site after any changes constitute your acceptance of those modifications.
                  </p>
                  <p className="mt-2">
                    If you do not agree to these Terms, please exit the Site immediately. Your use of the Site constitutes your agreement to comply with these Terms.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">2. Description of Services</h2>
                  <p>
                    Mental Trading Journal provides various services through the Site, including but not limited to trade journaling, trade analysis, and sharing or publishing of trades. To access these services, you are responsible for obtaining and maintaining all equipment necessary to use the Site, including a computer, internet access, and any associated fees.
                  </p>
                  <p className="mt-2">
                    We may modify or discontinue the Site or its features at any time, and we are not liable for any changes made to the Site.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">3. Registration Data and Privacy</h2>
                  <p>
                    To use certain features on the Site, you may be required to create an account and provide accurate, current, and complete information through the online registration form. You agree to update your registration data as necessary to ensure it remains accurate.
                  </p>
                  <p className="mt-2">
                    By registering, you grant us the right to disclose certain information to third parties, as outlined in our Privacy Policy.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">4. Conduct on Site</h2>
                  <p>You agree to use the Site in compliance with all applicable laws and regulations. You may not upload, share, or post content that:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Is unlawful, threatening, abusive, defamatory, fraudulent, or violates any rights of others;</li>
                    <li>Harasses or discriminates against others based on religion, gender, sexual orientation, race, ethnicity, age, or disability;</li>
                    <li>Infringes on intellectual property rights or is otherwise harmful, false, or misleading;</li>
                    <li>Contains viruses or other harmful code;</li>
                    <li>Impersonates another person or entity.</li>
                  </ul>
                  <p className="mt-2">
                    We have the right to remove any content that violates these Terms at our discretion and are not liable for delays in content removal.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">5. Subscriptions</h2>
                  <p>
                    We offer subscription-based services, generally paid in advance. By subscribing, you agree to the payment terms and that all subscription fees are non-refundable, except where required by law.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">6. Third Party Sites and Information</h2>
                  <p>
                    The Site may contain links to third-party websites. These sites are not under our control, and we are not responsible for their content, accuracy, or any actions associated with them.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">7. Intellectual Property Rights</h2>
                  <p>
                    All content on the Site is protected by copyright, trademark, or other intellectual property laws and is owned by Mental Trading Journal. You are granted a limited, non-transferable license to access and use the Site's content for personal use only. You may not copy, reproduce, or distribute any content without written permission from us.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">8. Accuracy of Information</h2>
                  <p>
                    All information provided on the Site is for educational purposes only. While we strive for accuracy, we do not guarantee that all information is complete or error-free. You should consult with a financial advisor or broker before making any investment decisions.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">9. Investment Decisions</h2>
                  <p>
                    You assume full responsibility for any investment decisions based on information obtained from the Site. Mental Trading Journal does not advocate the purchase or sale of any specific investment vehicles. We recommend consulting with a financial representative before acting on any advice or information from the Site.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">10. Shared Trades</h2>
                  <p className="font-medium text-white">a. Posting and Commenting</p>
                  <p>
                    By posting or sharing content on the Site, you grant us an irrevocable, royalty-free, transferable license to use, modify, distribute, and publicly display your content. You represent that you own the content you post and have the right to share it. You agree to indemnify and hold Mental Trading Journal harmless from any claims arising from your content.
                  </p>
                  
                  <p className="font-medium text-white mt-2">b. Accessing</p>
                  <p>
                    While we provide the service for informational purposes, you agree that we are not responsible for the accuracy, availability, or reliability of any content shared on the Site. You assume all risks related to using content and agree not to misuse information obtained from the service. We are not responsible for external links shared on the Site, and their inclusion does not imply our endorsement.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Disclaimer of Warranties</h2>
                  <p>
                    All materials and services provided on this site are offered on an "as is" and "as available" basis without warranty of any kind, either express or implied, including, but not limited to, the implied warranties of merchantability or fitness for a particular purpose, or the warranty of non-infringement. We make no warranties that: (A) the services and materials will meet your requirements; (B) the services and materials will be uninterrupted, timely, secure, or error-free; (C) the results obtained from using the services or materials will be effective, accurate, or reliable; or (D) the quality of any products, services, or information obtained from us or our affiliates will meet your expectations or be free from errors, mistakes, or defects.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">11. Limitation of Liability</h2>
                  <p>
                    In no event shall we or our affiliates be liable for any special, punitive, incidental, indirect, or consequential damages of any kind, including damages resulting from loss of use, data, or profits, whether or not we were advised of the possibility of such damages. This includes any liability arising from the use of this site or related websites.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">12. Indemnification</h2>
                  <p>
                    You agree to defend, indemnify, and hold us and our affiliates harmless from all liabilities, claims, and expenses arising from your use or misuse of this site. We reserve the right to assume exclusive defense and control of any matter subject to indemnification by you, in which case you agree to cooperate with us in asserting defenses.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">13. Security and Password</h2>
                  <p>
                    You are responsible for maintaining the confidentiality of your password and account and for all acts or omissions that occur through the use of your account. You must ensure that others do not access your account. Our personnel will never ask for your password. If you transfer or share your account, we may immediately terminate your access. You agree to immediately notify us of any unauthorized use of your account.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">14. International Use</h2>
                  <p>
                    This site may be accessible worldwide, but we make no representation that the materials are appropriate or available for use outside the United States. Accessing this site from locations where the content is illegal is prohibited. You are responsible for complying with local laws when using this site from other countries.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">15. Termination of Use</h2>
                  <p>
                    We may terminate or suspend your access to this site at our discretion, with or without notice, for any reason, including for breach of these terms of service. Any fraudulent, abusive, or illegal activity may result in immediate termination and referral to law enforcement authorities.
                  </p>
                  <p className="mt-2">
                    Upon termination, your right to use the services immediately ceases, and we may deactivate or delete your account and related information without liability.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">16. Governing Law</h2>
                  <p>
                    This site is controlled by us from our offices in Florida, United States. Accessing this site from other locations is at your own risk and you are responsible for complying with local laws. Any disputes arising out of or in connection with the use of this site shall be governed by the laws of the state of Florida.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">17. Notices</h2>
                  <p>
                    Notices to us must be sent to the attention of customer service at support@mentaltradingjournal.com. We may broadcast notices through the site to inform you of important changes or events.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">18. Entire Agreement</h2>
                  <p>
                    This document constitutes the entire agreement between us regarding the use of this site and supersedes all prior agreements. Any attempt to alter or supplement these terms will be void unless agreed in writing by both parties.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">19. Miscellaneous</h2>
                  <p>
                    In any action to enforce these terms, the prevailing party will be entitled to costs and attorneys' fees. Any cause of action must be instituted within one year after the claim arises or be waived.
                  </p>
                  <p className="mt-2">
                    You may not assign your rights and obligations under these terms, and we may assign our rights and obligations freely. We shall not be liable for delays or non-delivery of products or services due to events beyond our control.
                  </p>
                  <p className="mt-2">
                    If any part of these terms is held invalid or unenforceable, it will be construed to reflect the original intention, and the remaining terms will remain in effect.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">20. Contact Information</h2>
                  <p>
                    The services provided on this site are offered by mentaltradingjournal.com. If you notice any violations of these terms, please contact us at support@mentaltradingjournal.com
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">21. Refunds and Cancellations</h2>
                  <p>
                    Mental Trading Journal has a no refund policy after sign-up. All payments are final and non-refundable. It is your responsibility to cancel your account before the next billing cycle. Mental Trading Journal is not responsible for continued subscriptions if you forget to cancel your account.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default TermsOfService;
