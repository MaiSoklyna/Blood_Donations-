import ItemsClient from './ItemsClient';

export const metadata = {
  title: 'API Items',
  description: 'View items from the BloodConnect API.',
};

export default function ItemsPage() {
  return <ItemsClient />;
}