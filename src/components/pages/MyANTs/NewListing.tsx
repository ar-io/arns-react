import { createAoSigner } from '@ar.io/sdk';
import { createListing } from '@blockydevs/arns-marketplace-data';
import {
  Button,
  Card,
  CheckboxWithLabel,
  DatePicker,
  GoBackHeader,
  Input,
  Label,
  Row,
  Select,
  formatDate,
} from '@blockydevs/arns-marketplace-ui';
import { useGlobalState, useWalletState } from '@src/state';
import eventEmitter from '@src/utils/events';
import '@src/utils/marketplace';
import {
  BLOCKYDEVS_MARKETPLACE_PROCESS_ID,
  DecreaseInterval,
  Duration,
  dutchDecreaseIntervalOptions,
  dutchDurationOptions,
  englishDurationOptions,
  getMsFromDuration,
  getMsFromInterval,
  marketplaceQueryKeys,
  mergeDateAndTime,
} from '@src/utils/marketplace';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addMilliseconds } from 'date-fns';
import { useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { PriceScheduleModal } from './PriceScheduleModal';

type Step = 1 | 2 | 3;

interface FormState {
  type: string;
  price: string;
  minimumPrice: string;
  duration: Duration | undefined;
  decrease: DecreaseInterval | undefined;
  hasExpirationTime: boolean;
  date: Date | undefined;
  time: string;
}

const typeOptions = [
  { label: 'Fixed price', value: 'fixed' },
  { label: 'English auction', value: 'english' },
  { label: 'Dutch auction', value: 'dutch' },
] as const;

function MyANTsNewListing() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const { antProcessId } = useParams();
  const [searchParams] = useSearchParams();
  const [{ antAoClient, arioProcessId }] = useGlobalState();
  const [{ wallet, walletAddress }] = useWalletState();
  const now = new Date();
  const [form, setForm] = useState<FormState>({
    type: '',
    price: '',
    minimumPrice: '',
    duration: undefined,
    decrease: undefined,
    hasExpirationTime: false,
    date: now,
    time: '12:00:00',
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!wallet || !walletAddress) {
        throw new Error('No wallet connected');
      }

      if (!wallet.contractSigner) {
        throw new Error('No wallet signer available');
      }

      if (!antProcessId) {
        throw new Error('antProcessId is missing');
      }

      if (!form.price) {
        throw new Error('No price specified');
      }

      if (!form.type) {
        throw new Error('No type specified');
      }

      const selectedDateTime =
        form.hasExpirationTime || form.duration === 'custom'
          ? mergeDateAndTime(form.date, form.time)
          : null;

      if (selectedDateTime && selectedDateTime.getTime() < Date.now()) {
        throw new Error('Invalid date: cannot be in the past');
      }

      return await createListing({
        ao: antAoClient,
        antProcessId,
        marketplaceProcessId: BLOCKYDEVS_MARKETPLACE_PROCESS_ID,
        arioProcessId,
        waitForConfirmation: false,
        config: (() => {
          switch (form.type) {
            case 'fixed': {
              const expiresAt = form.hasExpirationTime
                ? mergeDateAndTime(form.date, form.time)?.getTime()
                : undefined;

              return {
                type: form.type,
                price: form.price.toString(),
                expiresAt,
              };
            }
            case 'dutch': {
              if (!form.minimumPrice) {
                throw new Error('minimum price is missing');
              }

              if (!form.decrease) {
                throw new Error('decrease interval is missing');
              }

              if (!form.duration) {
                throw new Error('duration is missing');
              }

              const decreaseIntervalMs = getMsFromInterval(form.decrease);
              const durationMs = getMsFromDuration(
                form.duration,
                form.date,
                form.time,
              );

              return {
                type: form.type,
                price: form.price.toString(),
                minimumPrice: form.minimumPrice.toString(),
                decreaseInterval: decreaseIntervalMs.toString(),
                ...(durationMs && { expiresAt: Date.now() + durationMs }),
              };
            }
            case 'english': {
              if (!form.duration) {
                throw new Error('duration is missing');
              }

              const durationMs = getMsFromDuration(
                form.duration,
                form.date,
                form.time,
              );

              const expiresAt = durationMs
                ? Date.now() + durationMs
                : undefined;

              return {
                type: form.type,
                price: form.price.toString(),
                expiresAt,
              };
            }
            default: {
              throw new Error(`Unsupported listing type ${form.type}`);
            }
          }
        })(),
        walletAddress: walletAddress.toString(),
        signer: createAoSigner(wallet.contractSigner),
      });
    },
  });

  const name = searchParams.get('name') ?? '-';
  const endDate =
    form.duration === 'custom'
      ? form.date
        ? `${formatDate(form.date.toString(), 'yyyy-MM-dd')}T${form.time}`
        : now.toISOString()
      : addMilliseconds(
          now,
          form.duration ? getMsFromDuration(form.duration) : 0,
        ).toISOString();

  const renderProperGoBackHeader = (step: Step) => {
    switch (step) {
      case 1:
        return (
          <GoBackHeader
            title="Create new listing"
            className="w-full my-12"
            onGoBack={() => {
              navigate('/my-ants');
            }}
          />
        );
      case 2:
        return (
          <GoBackHeader
            title="Confirm listing"
            className="w-full my-12"
            onGoBack={() => {
              setStep(1);
            }}
          />
        );
      case 3:
        return (
          <GoBackHeader
            title="Success! Your listing is now live"
            className="w-full my-12"
          />
        );
    }
  };

  const updateForm = <T extends keyof FormState>(
    field: T,
    value: FormState[T],
  ) => {
    setForm((state) => ({
      ...state,
      [field]: value,
    }));
  };

  return (
    <>
      {renderProperGoBackHeader(step)}
      <div className="w-full px-8 max-w-2xl mx-auto pb-12">
        <Card className="flex flex-col gap-8">
          <Row label="Domain name" value={name} variant="large" />
          {step === 1 ? (
            <>
              <div className="flex flex-col gap-2">
                <Label>Type of listing</Label>
                <Select
                  placeholder="Type of listing"
                  className="w-full"
                  defaultValue={form.type}
                  onValueChange={(value) => updateForm('type', value)}
                  options={typeOptions}
                />
              </div>
              <Input
                onChange={(e) => updateForm('price', e.target.value)}
                value={form.price}
                min={0}
                label="Price"
                suffix="ARIO"
                type="number"
              />
              {form.type === 'dutch' ? (
                <>
                  <Input
                    onChange={(e) => updateForm('minimumPrice', e.target.value)}
                    value={form.minimumPrice}
                    label="Minimum price (floor)"
                    suffix="ARIO"
                    type="number"
                  />
                  <div className="flex flex-col gap-2">
                    <Label>Duration</Label>
                    <Select
                      placeholder="Choose duration"
                      className="w-full"
                      options={dutchDurationOptions}
                      onValueChange={(value) =>
                        updateForm('duration', value as Duration)
                      }
                    />
                  </div>
                  {form.duration === 'custom' && (
                    <DatePicker
                      date={form.date}
                      open={open}
                      setDate={(date) => updateForm('date', date)}
                      setOpen={setOpen}
                      time={form.time}
                      setTime={(time) => updateForm('time', time)}
                    />
                  )}
                  <div className="flex flex-col gap-2">
                    <Label>Price decrease interval</Label>
                    <Select
                      placeholder="Choose decrease interval"
                      className="w-full"
                      options={dutchDecreaseIntervalOptions}
                      onValueChange={(value) =>
                        updateForm('decrease', value as DecreaseInterval)
                      }
                    />
                    <PriceScheduleModal
                      startingPrice={Number(form.price)}
                      minimumPrice={Number(form.minimumPrice)}
                      dateFrom={now}
                      dateTo={new Date(endDate)}
                      decreaseInterval={form.decrease}
                    />
                  </div>
                </>
              ) : form.type === 'english' ? (
                <>
                  <div className="flex flex-col gap-2">
                    <Label>Duration</Label>
                    <Select
                      placeholder="Choose duration"
                      className="w-full"
                      options={englishDurationOptions}
                      onValueChange={(value) =>
                        updateForm('duration', value as Duration)
                      }
                    />
                  </div>
                  {form.duration === 'custom' && (
                    <DatePicker
                      open={open}
                      setOpen={setOpen}
                      date={form.date}
                      time={form.time}
                      setDate={(date) => updateForm('date', date)}
                      setTime={(time) => updateForm('time', time)}
                    />
                  )}
                </>
              ) : (
                <div className="flex flex-col">
                  <p className="text-white mb-0.5">Expiration time</p>
                  <p className="text-[var(--ar-color-neutral-500)] mb-4 text-sm">
                    Leave unchecked to keep the listing active until sold or
                    removed.
                  </p>
                  <CheckboxWithLabel
                    label="Set expiration date"
                    checked={form.hasExpirationTime}
                    onCheckedChange={() => {
                      updateForm('hasExpirationTime', !form.hasExpirationTime);
                      updateForm('time', '12:00:00');
                      updateForm('date', undefined);
                    }}
                  />
                  {form.hasExpirationTime && (
                    <div className="mt-6">
                      <DatePicker
                        open={open}
                        setOpen={setOpen}
                        date={form.date}
                        time={form.time}
                        setDate={(date) => updateForm('date', date)}
                        setTime={(time) => updateForm('time', time)}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <Row label="Type of listing" value={form.type} />
              <Row
                label={form.type === 'english' ? 'Starting price' : 'Price'}
                value={`${form.price} ARIO`}
              />
              {form.type === 'dutch' ? (
                <>
                  <Row
                    label="Minimum price (Floor price)"
                    value={`${form.minimumPrice} ARIO`}
                  />
                  <Row label="Duration" value={form.duration} />
                  <Row
                    label="Price decrease interval"
                    value={`Every ${form.decrease}`}
                  />
                  <PriceScheduleModal
                    startingPrice={Number(form.price)}
                    minimumPrice={Number(form.minimumPrice)}
                    dateFrom={now}
                    dateTo={new Date(endDate)}
                    decreaseInterval={form.decrease}
                  />
                </>
              ) : form.type === 'english' ? (
                <>
                  <Row label="Duration" value={form.duration} />
                </>
              ) : (
                <>
                  {form.hasExpirationTime ? (
                    <Row
                      label="Expiration time"
                      value={
                        form.date
                          ? `${formatDate(form.date.toString(), 'dd.MM.yy')} ${
                              form.time
                            }`
                          : '-'
                      }
                    />
                  ) : (
                    <Row
                      label="Expiration time"
                      value="No time limit"
                      desc="Listing remains active until sold or removed"
                    />
                  )}
                </>
              )}
            </>
          )}

          <div className="flex gap-2 justify-end mt-4">
            {step !== 3 ? (
              <>
                <Button
                  variant="outline"
                  size="small"
                  onClick={() => {
                    if (step === 1) navigate('/my-ants');
                    else setStep(1);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="small"
                  disabled={mutation.isPending || mutation.isSuccess}
                  onClick={() => {
                    if (step === 1) setStep(2);
                    else {
                      mutation.mutate(undefined, {
                        onError: (error) => {
                          console.error(error);
                          eventEmitter.emit('error', {
                            name: 'Failed to create listing',
                            message: error.message,
                          });
                        },
                        onSuccess: async (data) => {
                          console.log('listing created', { data });
                          setStep(3);
                          void Promise.allSettled([
                            queryClient.refetchQueries({
                              queryKey: [marketplaceQueryKeys.listings.all],
                            }),
                            queryClient.refetchQueries({
                              queryKey: [marketplaceQueryKeys.myANTs.all],
                            }),
                          ]);
                        },
                      });
                    }
                  }}
                >
                  {step === 1
                    ? 'Next'
                    : mutation.isPending
                    ? 'Confirming listing...'
                    : mutation.isSuccess
                    ? 'Listing created successfully'
                    : 'Confirm listing'}
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  const listingId = mutation.data?.listing?.orderId;
                  navigate(listingId ? `/listings/${listingId}` : '/listings');
                }}
              >
                View listing
              </Button>
            )}
          </div>
        </Card>
        {step === 3 && (
          <div className="flex gap-6 mt-6">
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                navigate('/my-ants');
              }}
            >
              List another ANT
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                navigate('/listings');
              }}
            >
              Go to marketplace
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

export default MyANTsNewListing;
