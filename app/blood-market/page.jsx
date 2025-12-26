import BloodMarketClient from './BloodMarketClient.jsx';
import Header from './../../components/layout/Header.jsx';

export const metadata = {
  title: 'Blood Market',
  description: 'Request or offer blood donations to help those in need across Cambodia.',
};

export default function BloodMarketPage() {
  return (
    <>
      <Header />
      <BloodMarketClient />
    </>
  );
}