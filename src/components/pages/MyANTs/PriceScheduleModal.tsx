import { arioToMario, marioToArio } from '@blockydevs/arns-marketplace-data';
import {
  Button,
  DecreaseScheduleTable,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Schedule,
  formatDate,
  getDutchListingSchedule,
} from '@blockydevs/arns-marketplace-ui';
import { DecreaseInterval, getMsFromInterval } from '@src/utils/marketplace';

interface Props {
  minimumPrice: number;
  startingPrice: number;
  decreaseInterval: DecreaseInterval | undefined;
  dateFrom: Date;
  dateTo: Date;
}

export const PriceScheduleModal: React.FC<Props> = ({
  startingPrice,
  minimumPrice,
  decreaseInterval,
  dateFrom,
  dateTo,
}) => {
  // generate estimated dutch price schedule
  // real schedule will be different because of CreatedAt and EndedAt mismatch
  const dutchPriceSchedule: Schedule[] = (() => {
    try {
      if (!decreaseInterval) return [];
      const decreaseIntervalMs = getMsFromInterval(decreaseInterval);
      if (!decreaseIntervalMs || decreaseIntervalMs === 0) return [];

      const msSpan = dateTo.getTime() - dateFrom.getTime();
      const totalIntervals = Math.floor(msSpan / decreaseIntervalMs);
      if (totalIntervals <= 0) return [];
      const priceDelta = startingPrice - minimumPrice;
      if (priceDelta <= 0) return [];
      const decreaseStepArio = priceDelta / totalIntervals;

      const decreaseStepMario = Math.round(
        Number(arioToMario(decreaseStepArio)),
      ).toString();

      return getDutchListingSchedule({
        createdAt: dateFrom.getTime(),
        endedAt: dateTo.getTime(),
        startingPrice: arioToMario(startingPrice),
        minimumPrice: arioToMario(minimumPrice),
        decreaseInterval: decreaseIntervalMs.toString(),
        decreaseStep: decreaseStepMario,
      }).map((item) => ({
        date: formatDate(item.date),
        price: Number(Number(marioToArio(item.price)).toFixed(6)),
      }));
    } catch (err) {
      console.warn('Error generating dutch price schedule', err);
      return [];
    }
  })();

  return (
    <Dialog>
      <DialogTrigger disabled={!decreaseInterval} asChild>
        <Button variant="link" size="small" className="inline-flex w-fit px-0">
          View price schedule
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Estimated price decrease schedule
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[480px] overflow-auto overflow-x-hidden">
          <DecreaseScheduleTable data={dutchPriceSchedule} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
