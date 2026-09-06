import { Head } from '@inertiajs/react';
import { AppLayout } from '@/layouts/AppLayout';
import { useState } from 'react';
import { usePage } from '@inertiajs/react';
import { Stack, Row, Grid } from '@/components/pouf/layout';
import { Card } from '@/components/pouf/surface';
import { Heading, Text, Eyebrow } from '@/components/pouf/text';
import { Stat } from '@/components/pouf/readout';
import { Badge } from '@/components/pouf/media';
import { Segmented } from '@/components/pouf/Segmented';
import { AreaChart } from '@/components/pouf/charts';
import { Table } from '@/components/pouf/table';
import { Status } from '@/components/pouf/status';

interface Order {
    id: string;
    customer: string;
    amount: number;
    state: 'paid' | 'pending' | 'failed';
}

const ORDERS: Order[] = [
    { id: '1', customer: 'Apple Inc.', amount: 1204, state: 'paid' },
    { id: '2', customer: 'Banana Co.', amount: 860.5, state: 'pending' },
    { id: '3', customer: 'Cherry LLC', amount: 432, state: 'paid' },
    { id: '4', customer: 'Date & Sons', amount: 98.25, state: 'failed' },
];

const STATE_TONE = { paid: 'mint', pending: 'yellow', failed: 'pink' } as const;
const STATE_RANK = { failed: 0, pending: 1, paid: 2 } as const;

const REVENUE = {
    day: [
        { label: '9a', total: 4 }, { label: '11a', total: 9 }, { label: '1p', total: 7 },
        { label: '3p', total: 14 }, { label: '5p', total: 11 }, { label: '7p', total: 18 },
    ],
    week: [
        { label: 'Mon', total: 40 }, { label: 'Tue', total: 55 }, { label: 'Wed', total: 70 },
        { label: 'Thu', total: 52 }, { label: 'Fri', total: 85 }, { label: 'Sat', total: 60 },
        { label: 'Sun', total: 92 },
    ],
    month: [
        { label: 'W1', total: 210 }, { label: 'W2', total: 288 },
        { label: 'W3', total: 245 }, { label: 'W4', total: 331 },
    ],
} as const;

type Range = keyof typeof REVENUE;
const TOTALS: Record<Range, string> = { day: '$2.4k', week: '$48.2k', month: '$186k' };

const money = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function DashboardPage() {
    const [range, setRange] = useState<Range>('week');
    const { auth } = usePage<any>().props;

    return (
        <AppLayout>
            <Head title="Dashboard" />
            <Stack gap={5}>
                <Row justify="between">
                    <Stack gap={1}>
                        <Eyebrow>Dashboard</Eyebrow>
                        <Heading level={1}>
                            Selamat datang{auth?.user ? `, ${auth.user.name}` : ''}
                        </Heading>
                    </Stack>
                    <Status label="All systems go" tone="up" at={Date.now()} />
                </Row>

                <Grid cols={3}>
                    <Stat label="Revenue" value={TOTALS[range]} icon="ok" tone="mint" />
                    <Stat label="Orders" value="1,204" icon="add" tone="blue" />
                    <Stat label="Refunds" value="12" icon="down" tone="pink" />
                </Grid>

                <Card>
                    <Stack gap={4}>
                        <Row justify="between">
                            <Heading level={3}>Revenue</Heading>
                            <Segmented
                                label="Range"
                                value={range}
                                onChange={(v) => setRange(v as Range)}
                                options={[
                                    { value: 'day', label: 'Day' },
                                    { value: 'week', label: 'Week' },
                                    { value: 'month', label: 'Month' },
                                ]}
                            />
                        </Row>
                        <AreaChart
                            data={[...REVENUE[range]]}
                            dataKey="label"
                            height={220}
                            series={[{ key: 'total', label: 'Revenue', tone: 'purple' }]}
                        />
                    </Stack>
                </Card>

                <Card>
                    <Stack gap={4}>
                        <Row justify="between">
                            <Heading level={3}>Recent Orders</Heading>
                            <Badge tone="blue">{ORDERS.length} new</Badge>
                        </Row>
                        <Table
                            rows={ORDERS}
                            getKey={(o) => o.id}
                            columns={[
                                {
                                    key: 'customer',
                                    header: 'Customer',
                                    render: (o) => <Text>{o.customer}</Text>,
                                    sort: (a, b) => a.customer.localeCompare(b.customer),
                                },
                                {
                                    key: 'amount',
                                    header: 'Amount',
                                    align: 'right',
                                    mono: true,
                                    render: (o) => <Text num>{money(o.amount)}</Text>,
                                    sort: (a, b) => a.amount - b.amount,
                                },
                                {
                                    key: 'state',
                                    header: 'Status',
                                    align: 'right',
                                    render: (o) => <Badge tone={STATE_TONE[o.state]}>{o.state}</Badge>,
                                    sort: (a, b) => STATE_RANK[a.state] - STATE_RANK[b.state],
                                },
                            ]}
                        />
                    </Stack>
                </Card>
            </Stack>
        </AppLayout>
    );
}
