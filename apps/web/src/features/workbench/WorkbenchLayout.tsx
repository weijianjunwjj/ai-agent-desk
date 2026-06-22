import { Layout } from 'antd';

import { ConversationDetailPanel } from './ConversationDetailPanel';
import { ConversationListPanel } from './ConversationListPanel';
import { CustomerContextPanel } from './CustomerContextPanel';
import { WorkbenchHeader } from './WorkbenchHeader';

// Three-column workbench shell (PRD §7.1):
// Header / [会话列表 | 消息流+AI 建议 | 客户上下文+时间线].
const { Header, Sider, Content } = Layout;

export function WorkbenchLayout() {
  return (
    <Layout style={{ height: '100vh' }}>
      <Header style={{ padding: 0, background: '#fff', borderBottom: '1px solid #f0f0f0' }}>
        <WorkbenchHeader />
      </Header>
      <Layout>
        <Sider
          width={320}
          theme="light"
          style={{ borderRight: '1px solid #f0f0f0', overflow: 'auto' }}
        >
          <ConversationListPanel />
        </Sider>
        <Content style={{ overflow: 'auto', background: '#f5f5f5' }}>
          <ConversationDetailPanel />
        </Content>
        <Sider
          width={360}
          theme="light"
          style={{ borderLeft: '1px solid #f0f0f0', overflow: 'auto' }}
        >
          <CustomerContextPanel />
        </Sider>
      </Layout>
    </Layout>
  );
}
