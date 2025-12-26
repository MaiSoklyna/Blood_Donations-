import HospitalsClient from './HospitalsClient';
import Header from '../../components/layout/Header';

export const metadata = {
  title: 'Partner Hospitals',
  description: 'Find blood donation centers and check blood availability across Cambodia.',
};

export default function HospitalsPage() {
  return (
    <>
      <Header />
      <HospitalsClient />
    </>
  );
}