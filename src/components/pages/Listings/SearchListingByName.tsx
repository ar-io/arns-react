import { searchANT } from '@blockydevs/arns-marketplace-data';
import {
  Button,
  Paragraph,
  SearchInput,
} from '@blockydevs/arns-marketplace-ui';
import { useGlobalState } from '@src/state';
import eventEmitter from '@src/utils/events';
import { BLOCKYDEVS_ACTIVITY_PROCESS_ID } from '@src/utils/marketplace';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchListingByName = () => {
  const [searchValue, setSearchValue] = useState('');
  const [{ aoClient, arioProcessId }] = useGlobalState();
  const navigate = useNavigate();
  const mutationSearch = useMutation({
    mutationFn: async (name: string) => {
      return searchANT({
        name,
        ao: aoClient,
        networkProcessId: arioProcessId,
        activityProcessId: BLOCKYDEVS_ACTIVITY_PROCESS_ID,
      });
    },
    onError: (error) => {
      eventEmitter.emit('error', {
        name: `Failed search for "${searchValue}"`,
        message: error.message,
      });
    },
    onSuccess: (data) => {
      if (data.ant && data.listing) {
        navigate(`/listings/${data.listing.orderId}`);
      }
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue) return;
    mutationSearch.mutate(searchValue);
  };

  const shouldRenderResult =
    mutationSearch.isSuccess && !mutationSearch.data.listing;

  return (
    <form onSubmit={handleSearchSubmit}>
      <SearchInput
        placeholder="Search domain (e.g. arns)"
        className="py-6"
        value={searchValue}
        isPending={mutationSearch.isPending}
        onChange={(value) => {
          setSearchValue(value);
          mutationSearch.reset();
        }}
      />
      {shouldRenderResult && (
        <div className="mt-6 flex flex-col items-center">
          {!!mutationSearch.data.ant && !mutationSearch.data.listing && (
            <Paragraph>
              Domain{' '}
              <span className="text-error">{mutationSearch.variables}</span> is
              taken{' '}
            </Paragraph>
          )}
          {!mutationSearch.data.ant && (
            <>
              <Paragraph className="mb-2">
                Domain{' '}
                <span className="text-success">{mutationSearch.variables}</span>{' '}
                is available
              </Paragraph>
              <Button
                variant="primary"
                type="button"
                onClick={() => {
                  navigate(`/register/${mutationSearch.variables}`);
                }}
              >
                Register
              </Button>
            </>
          )}
        </div>
      )}
    </form>
  );
};

export default SearchListingByName;
