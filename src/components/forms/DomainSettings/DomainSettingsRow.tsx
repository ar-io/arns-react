import { List } from 'antd';

export default function DomainSettingsRow({
  label,
  value,
  action,
}: {
  label?: string;
  value?: React.ReactNode;
  action?: React.ReactNode[];
}) {
  return (
    <>
      <List.Item
        style={{
          display: 'flex',
          border: 'var(--text-faded) 1px solid',
          borderRadius: '4px',
          margin: '10px',
          justifyContent: 'space-between',
        }}
        actions={action}
      >
        <List.Item.Meta description={label} />
        <List.Item.Meta description={value} />
      </List.Item>
    </>
  );
}
