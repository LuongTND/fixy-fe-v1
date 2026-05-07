import { Card, Row, Col, Statistic, Table, Empty } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const columns = [
  {
    title: 'Mã Đơn',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'Khách Hàng',
    dataIndex: 'customer',
    key: 'customer',
  },
  {
    title: 'Giá Trị',
    dataIndex: 'amount',
    key: 'amount',
  },
  {
    title: 'Trạng Thái',
    dataIndex: 'status',
    key: 'status',
  },
];

const data = [
  {
    key: '1',
    id: '#001',
    customer: 'Nguyễn Văn A',
    amount: '1,200,000 đ',
    status: 'Hoàn Thành',
  },
  {
    key: '2',
    id: '#002',
    customer: 'Trần Thị B',
    amount: '950,000 đ',
    status: 'Đang Xử Lý',
  },
  {
    key: '3',
    id: '#003',
    customer: 'Lê Văn C',
    amount: '2,500,000 đ',
    status: 'Hoàn Thành',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <Row gutter={16}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Tổng Doanh Thu"
              value={45000}
              prefix="$"
              suffix={<ArrowUpOutlined style={{ color: '#3f8600' }} />}
              valueStyle={{ color: '#3f8600' }}
            />
            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>↑ 12.5% từ tháng trước</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Tổng Đơn Hàng"
              value={1234}
              suffix={<ArrowUpOutlined style={{ color: '#3f8600' }} />}
              valueStyle={{ color: '#3f8600' }}
            />
            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>↑ 8.3% từ tháng trước</p>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Tổng Khách Hàng"
              value={567}
              suffix={<ArrowDownOutlined style={{ color: '#cf1322' }} />}
              valueStyle={{ color: '#cf1322' }}
            />
            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>↓ 3.1% từ tháng trước</p>
          </Card>
        </Col>
      </Row>

      <Card title="Đơn Hàng Gần Đây" bordered={false}>
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          locale={{ emptyText: <Empty description="Không có dữ liệu" /> }}
        />
      </Card>
    </div>
  );
}
