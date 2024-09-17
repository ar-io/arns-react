import { AoArNSNameData } from '@ar.io/sdk';
import { Loader } from '@src/components/layout';
import { decodeDomainToASCII } from '@src/utils';
import { ARWEAVE_HOST } from '@src/utils/constants';
import { motion } from 'framer-motion';
import { Suspense } from 'react';
import { Link } from 'react-router-dom';

import { ARNSMapping } from '../../../types';
import DomainDetailsCard from '../DomainDetailsCard';
import './styles.css';

const protocol = 'https';

function ARNSCard({
  domain,
  domainRecord,
  gateway = ARWEAVE_HOST,
  imageUrl,
}: Omit<ARNSMapping, 'processId'> & {
  domainRecord: AoArNSNameData;
  gateway?: string;
  imageUrl: string;
}) {
  return (
    <motion.div
      initial={{
        scale: 1,
      }}
      whileHover="hover" // Define the hover state
      transition={
        {
          //  when: 'afterChildren',
        }
      }
      variants={{
        hover: {
          scale: 1.05,
        },
      }}
      className="relative"
    >
      <Link
        target="_blank"
        to={`${protocol}://${domain}.${gateway}`}
        className="arns-card hover w-fit relative pb-10"
        rel="noreferrer"
      >
        <img
          className="arns-preview fade-in"
          src={imageUrl}
          key={imageUrl}
          alt={`${domain}.${gateway}`}
          width={'100%'}
          height={'100%'}
        />

        <motion.div
          className="flex flex-col rounded w-full items-center absolute top-0 left-0 overflow-hidden"
          initial={{
            height: '100%', // Initially collapsed
            backgroundImage: 'linear-gradient(rgba(0,0,0,0), rgb(24,25,26, 0))',
          }}
          transition={
            {
              //   when: 'afterChildren',
            }
          }
          variants={{
            hover: {
              height: '100%', // Expand to fit content
              backgroundImage:
                'linear-gradient(rgba(0,0,0,0.95), rgb(24,25,26))',
            },
          }}
        >
          {/* URL span is always visible but moves position on hover */}
          <motion.span
            className="flex flex-row text-white text-lg p-2 underline absolute justify-center"
            initial={{
              y: 230, // Start at normal position
            }}
            variants={{
              hover: {
                y: 0, // Move up on hover of parent
              },
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 35,
            }}
          >
            {`${decodeDomainToASCII(domain)}.${gateway}`}
          </motion.span>

          {/* Card details expanded when parent is hovered */}
          <motion.div
            initial={{
              y: 400, // Start below the visible area
              height: 0, // Initially collapsed
            }}
            variants={{
              hover: {
                y: 0, // Move up on hover of parent
                height: '100%', // Expand to fit content
              },
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 35,
              // duration: 1.5, // Smooth duration for expansion
            }}
            className="flex flex-col w-full px-4 pt-8 justify-center absolute"
            style={{ gap: '10px' }}
          >
            <Suspense>
              {domainRecord ? (
                <DomainDetailsCard domainRecord={domainRecord} />
              ) : (
                <Loader size={30} />
              )}
            </Suspense>
          </motion.div>
        </motion.div>
      </Link>{' '}
    </motion.div>
  );
}

export default ARNSCard;
