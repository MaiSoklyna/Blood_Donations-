import HospitalsClient from './HospitalsClient';

export const metadata = {
  title: 'Partner Hospitals',
  description: 'Find blood donation centers and check blood availability across Cambodia.',
};

export default function HospitalsPage() {
  return <HospitalsClient />;
}