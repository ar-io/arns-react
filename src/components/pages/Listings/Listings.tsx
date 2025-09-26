import {
  Header,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@blockydevs/arns-marketplace-ui';
import ActiveListingsTab from '@src/components/pages/Listings/ActiveListingsTab';
import CompletedListingsTab from '@src/components/pages/Listings/CompletedListingsTab';
import SearchListingByName from '@src/components/pages/Listings/SearchListingByName';

const Listings = () => {
  return (
    <div className="w-full p-8 pt-0">
      <div className="my-12">
        <Header size="h1" className="mb-4">
          ArNS Marketplace
        </Header>
        <SearchListingByName />
      </div>
      <Tabs defaultValue="1">
        <TabsList>
          <TabsTrigger value="1">Active Listings</TabsTrigger>
          <TabsTrigger value="2">Completed Listings</TabsTrigger>
        </TabsList>
        <TabsContent value="1">
          <ActiveListingsTab />
        </TabsContent>
        <TabsContent value="2">
          <CompletedListingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Listings;
