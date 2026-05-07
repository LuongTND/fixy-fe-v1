'use client';

import { Button as AntButton, Card, Space, Tag, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

/**
 * Example component using Ant Design components
 * Shows how to use Ant Design Button, Card, Space, Tag, etc.
 */
export function AntdExample() {
  return (
    <div className="p-6 space-y-6">
      <Card title="Ant Design Components" bordered={false}>
        <div className="space-y-4">
          {/* Buttons Example */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Buttons</h3>
            <Space>
              <AntButton type="primary">Primary</AntButton>
              <AntButton>Default</AntButton>
              <AntButton danger>Danger</AntButton>
              <AntButton icon={<PlusOutlined />}>Add</AntButton>
            </Space>
          </div>

          {/* Tags Example */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Tags</h3>
            <Space>
              <Tag color="blue">Success</Tag>
              <Tag color="orange">Processing</Tag>
              <Tag color="red">Error</Tag>
              <Tag>Default</Tag>
            </Space>
          </div>

          {/* Empty State Example */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Empty State</h3>
            <Empty description="No Data" style={{ marginTop: 48, marginBottom: 48 }} />
          </div>
        </div>
      </Card>

      {/* Card Grid Example */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card title="Card 1">
          <p>This is a card with Ant Design</p>
          <Space className="mt-4">
            <AntButton icon={<EditOutlined />}>Edit</AntButton>
            <AntButton icon={<DeleteOutlined />} danger>Delete</AntButton>
          </Space>
        </Card>

        <Card title="Card 2">
          <p>Another Ant Design card example</p>
          <Space className="mt-4">
            <AntButton type="primary">Action</AntButton>
            <AntButton>Cancel</AntButton>
          </Space>
        </Card>
      </div>
    </div>
  );
}
