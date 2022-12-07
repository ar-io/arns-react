import { useIsMobile } from '../../../../hooks';
import {
  AlertOctagonIcon,
  AlertTriangleIcon,
  CheckmarkIcon,
} from '../../../icons';
import './styles.css';

function RegistrationProgress({
  stages,
  stage,
}: {
  stages: { [x: number]: { title: string; status: string } };
  stage: number;
}) {
  const isMobile = useIsMobile();

  function handleColor(status: string | undefined) {
    switch (status) {
      case 'success':
        return 'var(--success-green)';
      case 'fail':
        return 'var(--error-red)';
      case 'pending':
        return 'var(--accent)';
      default:
        return '';
    }
  }
  function handleIcon(status: string | undefined) {
    switch (status) {
      case 'success':
        return (
          <CheckmarkIcon width={'14px'} height={'14px'} fill={'#444444'} />
        );
      case 'fail':
        return (
          <AlertOctagonIcon width={'18px'} height={'18px'} fill={'#444444'} />
        );
      case 'pending':
        return (
          <AlertTriangleIcon width={'18px'} height={'18px'} fill={'#444444'} />
        );
      default:
        return undefined;
    }
  }
  return (
    <>
      <div className="flex-row center" style={{ gap: '0' }}>
        {Object.entries(stages).map(([key, value], index) => {
          if (index === 0) {
            return (
              <div className="progressStage">
                <div
                  className="nodeContainer"
                  style={isMobile ? { width: '75px' } : {}}
                >
                  <span className="line" style={{ background: 'none' }}></span>
                  <span
                    className="progressStageCircle"
                    style={{ background: handleColor(value.status) }}
                  >
                    {handleIcon(value.status) ? handleIcon(value.status) : key}
                  </span>
                  <span
                    className="line"
                    style={{ background: handleColor(value.status) }}
                  ></span>
                </div>
                <span
                  className="textMedium white center"
                  style={isMobile ? { fontSize: '12px' } : {}}
                >
                  {value.title}
                </span>
              </div>
            );
          }
          if (index === Object.keys(stages).length - 1) {
            return (
              <div className="progressStage">
                <div
                  className="nodeContainer"
                  style={isMobile ? { width: '75px' } : {}}
                >
                  <span
                    className="line"
                    style={{ background: handleColor(value.status) }}
                  ></span>
                  <span
                    className="progressStageCircle"
                    style={{ background: handleColor(value.status) }}
                  >
                    {handleIcon(value.status) ? handleIcon(value.status) : key}
                  </span>
                  <span className="line" style={{ background: 'none' }}></span>
                </div>
                <span
                  className="textMedium white center"
                  style={isMobile ? { fontSize: '12px' } : {}}
                >
                  {value.title}
                </span>
              </div>
            );
          }
          if (index !== 0 && index !== Object.keys(stages).length - 1) {
            return (
              <div className="progressStage">
                <div
                  className="nodeContainer"
                  style={isMobile ? { width: '75px' } : {}}
                >
                  <span
                    className="line"
                    style={{ background: handleColor(value.status) }}
                  ></span>
                  <span
                    className="progressStageCircle"
                    style={
                      stage !== +key
                        ? { background: handleColor(value.status) }
                        : {
                            background: handleColor(value.status),
                            border: '3px solid white',
                            boxShadow: `0px 0px 0px 2px ${handleColor(
                              value.status,
                            )}`,
                          }
                    }
                  >
                    {handleIcon(value.status) ? handleIcon(value.status) : key}
                  </span>
                  <span
                    className="line"
                    style={{ background: handleColor(value.status) }}
                  ></span>
                </div>
                <span
                  className="textMedium white center"
                  style={isMobile ? { fontSize: '12px' } : {}}
                >
                  {value.title}
                </span>
              </div>
            );
          }
        })}
      </div>
    </>
  );
}

export default RegistrationProgress;
