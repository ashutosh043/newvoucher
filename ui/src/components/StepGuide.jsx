import '../styles/WifiSelectionPage.css';
import { motion } from 'framer-motion';
import {
  FaUserGraduate,
  FaEnvelope,
  FaShieldAlt,
  FaTicketAlt
} from 'react-icons/fa';

export default function StepsGuide() {
  const steps = [
    {
      title: 'Select Your Role',
      desc: [
        'Begin by choosing whether you are a Student or Faculty member.',
        'This ensures your voucher duration and access level is appropriate.',
        'A tailored experience improves network management and security.'
      ],
      Icon: FaUserGraduate
    },
    {
      title: 'Enter Email & Solve reCAPTCHA',
      desc: [
        'Use your verified institutional email to proceed.',
        'Complete the reCAPTCHA to confirm you’re not a bot.',
        'This step ensures authenticity and prevents misuse.'
      ],
      Icon: FaEnvelope
    },
    {
      title: 'Verify OTP',
      desc: [
        'You will receive a one-time password via email.',
        'Enter the OTP in the portal to authenticate your identity.',
        'Your identity is validated securely using this process.'
      ],
      Icon: FaShieldAlt
    },
    {
      title: 'Generate Voucher',
      desc: [
        'Once verified, click the generate button.',
        'Your unique, time-limited WiFi voucher will be ready instantly.',
        'Use it to log in and enjoy secure internet access.'
      ],
      Icon: FaTicketAlt
    }
  ];

  return (
    <div className="steps vertical-steps">
      <h2 className="section-title">Steps to Get Your Vouchers Now!</h2>
      <div className="step-column">
        {steps.map((step, index) => (
          <motion.div
            className="step-card-vertical"
            key={index}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.3 }}
            viewport={{ once: true }}
          >
            <div className="step-icon-container">
              <step.Icon className="step-icon" />
            </div>
            <div className="step-content">
              <h3>{step.title}</h3>
              {step.desc.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
