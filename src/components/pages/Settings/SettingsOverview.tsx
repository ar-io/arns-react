import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function SettingsOverview() {
  return (
    <div className="flex flex-col w-full h-full p-3">
      <div className="flex flex-col w-full h-full bg-background gap-5 p-2 rounded-xl text-sm">
        <Link
          className="flex flex-row justify-between p-4 bg-metallic-grey hover:bg-primary-thin border border-primary-thin text-white rounded-md font-semibold"
          to={'/settings/arns'}
        >
          ArNS Registry Settings <ChevronRight size={20} />
        </Link>
        <Link
          className="flex flex-row justify-between p-4 bg-metallic-grey hover:bg-primary-thin border border-primary-thin text-white rounded-md font-semibold"
          to={'/settings/network'}
        >
          Network Settings <ChevronRight size={20} />
        </Link>
      </div>
    </div>
  );
}

export default SettingsOverview;
