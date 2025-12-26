import TipsClient from './TipsClient.jsx';

import Header from '../../components/layout/Header.jsx';
export const metadata = {
  title: 'Blood Donation Tips',
  description: 'Everything you need to know about donating blood safely.',
};

export default function TipsPage() {
  return (
    <>
      <Header />
      <TipsClient />
    </>
  );
}