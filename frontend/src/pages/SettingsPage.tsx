import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

const SettingSection: React.FC<{
  title: string;
  icon: string;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="card p-6">
    <div className="flex items-center gap-3 mb-6">
      <span className="text-2xl">{icon}</span>
      <h2 className="text-lg font-semibold text-dream-800">{title}</h2>
    </div>
    <div className="space-y-6">{children}</div>
  </div>
);

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}> = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between">
    <div>
      <p className="font-medium text-dream-800">{label}</p>
      {description && <p className="text-sm text-dream-500 mt-1">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        checked ? 'bg-accent' : 'bg-dream-200'
      }`}
    >
      <span
        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-md ${
          checked ? 'translate-x-7' : 'translate-x-1'
        }`}
      />
    </button>
  </div>
);

export const SettingsPage: React.FC = () => {
  const { user, updateProfile, updateSettings, changePassword, logout, isLoading } =
    useAuthStore();

  const [profileForm, setProfileForm] = useState({
    username: user?.username || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [aiSettingsForm, setAiSettingsForm] = useState({
    volcengineAccessKey: '',
    volcengineSecretKey: '',
    volcengineModelEndpointId: '',
    defaultMood: user?.settings?.defaultMood || '',
    notificationsEnabled: user?.settings?.notificationsEnabled ?? true,
    dataEncryptionEnabled: user?.settings?.dataEncryptionEnabled ?? true,
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'password' | 'advanced'>('profile');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const tabs = [
    { id: 'profile' as const, label: '个人资料', icon: '👤' },
    { id: 'ai' as const, label: 'AI 设置', icon: '🤖' },
    { id: 'password' as const, label: '密码', icon: '🔐' },
    { id: 'advanced' as const, label: '高级', icon: '⚙️' },
  ];

  const showMessage = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setSuccessMessage('');
    } else {
      setSuccessMessage(msg);
      setErrorMessage('');
    }
    setTimeout(() => {
      setSuccessMessage('');
      setErrorMessage('');
    }, 3000);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ username: profileForm.username });
      showMessage('个人资料更新成功');
    } catch {
      showMessage('更新失败，请重试', true);
    }
  };

  const handleUpdateAISettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettings({
        volcengineAccessKey: aiSettingsForm.volcengineAccessKey || undefined,
        volcengineSecretKey: aiSettingsForm.volcengineSecretKey || undefined,
        volcengineModelEndpointId: aiSettingsForm.volcengineModelEndpointId || undefined,
        defaultMood: aiSettingsForm.defaultMood || undefined,
        notificationsEnabled: aiSettingsForm.notificationsEnabled,
        dataEncryptionEnabled: aiSettingsForm.dataEncryptionEnabled,
      });
      showMessage('AI 设置更新成功');
    } catch {
      showMessage('更新失败，请重试', true);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('两次输入的密码不一致', true);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      showMessage('新密码至少需要 8 个字符', true);
      return;
    }

    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      showMessage('密码修改成功');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch {
      showMessage('密码修改失败，请检查当前密码是否正确', true);
    }
  };

  const moodOptions = [
    { value: '', label: '不设置' },
    { value: 'joy', label: '😊 愉悦' },
    { value: 'peace', label: '😌 平静' },
    { value: 'sadness', label: '😢 悲伤' },
    { value: 'fear', label: '😨 恐惧' },
    { value: 'anxiety', label: '😰 焦虑' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-dream-800">设置</h1>
          <p className="text-dream-500 mt-1">管理你的账户和偏好设置</p>
        </div>
      </div>

      {successMessage && (
        <div className="card p-4 bg-green-50 border-green-200">
          <p className="text-green-600">{successMessage}</p>
        </div>
      )}

      {errorMessage && (
        <div className="card p-4 bg-red-50 border-red-200">
          <p className="text-red-600">{errorMessage}</p>
        </div>
      )}

      <div className="card p-1">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-accent text-white shadow-lg shadow-accent/25'
                  : 'text-dream-600 hover:bg-dream-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'profile' && (
        <SettingSection title="个人资料" icon="👤">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-soft-light to-accent flex items-center justify-center text-white text-3xl font-bold">
              {user?.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-dream-800">{user?.username}</h3>
              <p className="text-dream-500">{user?.email}</p>
              <p className="text-sm text-dream-400 mt-1">
                加入于 {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : ''}
              </p>
            </div>
          </div>

          <div className="divider"></div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="label">用户名</label>
              <input
                type="text"
                value={profileForm.username}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, username: e.target.value }))}
                className="input"
              />
            </div>
            <div>
              <label className="label">邮箱</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input bg-dream-50 cursor-not-allowed"
              />
              <p className="text-xs text-dream-400 mt-1">邮箱地址不可修改</p>
            </div>
            <button type="submit" disabled={isLoading} className="btn btn-primary">
              {isLoading ? '保存中...' : '保存修改'}
            </button>
          </form>
        </SettingSection>
      )}

      {activeTab === 'ai' && (
        <SettingSection title="AI 解析设置" icon="🤖">
          <div className="card p-4 bg-soft-light/5 border-soft-light/20">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h4 className="font-medium text-dream-800 mb-1">关于火山方舟 API</h4>
                <p className="text-sm text-dream-600 leading-relaxed">
                  SomniMap 使用火山方舟大模型进行梦境解析。你需要在火山方舟平台注册账号并获取 API 密钥。
                  所有 API 密钥都会安全存储，仅用于你自己的梦境解析。
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleUpdateAISettings} className="space-y-4">
            <div>
              <label className="label">
                Access Key ID <span className="text-dream-400">(火山方舟)</span>
              </label>
              <input
                type="password"
                value={aiSettingsForm.volcengineAccessKey}
                onChange={(e) =>
                  setAiSettingsForm((prev) => ({ ...prev, volcengineAccessKey: e.target.value }))
                }
                placeholder="输入你的 Access Key ID"
                className="input font-mono"
              />
            </div>

            <div>
              <label className="label">
                Secret Access Key <span className="text-dream-400">(火山方舟)</span>
              </label>
              <input
                type="password"
                value={aiSettingsForm.volcengineSecretKey}
                onChange={(e) =>
                  setAiSettingsForm((prev) => ({ ...prev, volcengineSecretKey: e.target.value }))
                }
                placeholder="输入你的 Secret Access Key"
                className="input font-mono"
              />
            </div>

            <div>
              <label className="label">
                模型端点 ID <span className="text-dream-400">(火山方舟)</span>
              </label>
              <input
                type="text"
                value={aiSettingsForm.volcengineModelEndpointId}
                onChange={(e) =>
                  setAiSettingsForm((prev) => ({ ...prev, volcengineModelEndpointId: e.target.value }))
                }
                placeholder="例如：doubao-seed-1-8k"
                className="input font-mono"
              />
              <p className="text-xs text-dream-400 mt-1">
                可以使用火山方舟的豆包模型、文心一言等大模型端点
              </p>
            </div>

            <div className="divider"></div>

            <div>
              <label className="label">默认情绪 <span className="text-dream-400">(可选)</span></label>
              <select
                value={aiSettingsForm.defaultMood}
                onChange={(e) =>
                  setAiSettingsForm((prev) => ({ ...prev, defaultMood: e.target.value }))
                }
                className="input"
              >
                {moodOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="divider"></div>

            <ToggleSwitch
              checked={aiSettingsForm.notificationsEnabled}
              onChange={(checked) =>
                setAiSettingsForm((prev) => ({ ...prev, notificationsEnabled: checked }))
              }
              label="启用通知"
              description="接收梦境提醒和分析完成通知"
            />

            <ToggleSwitch
              checked={aiSettingsForm.dataEncryptionEnabled}
              onChange={(checked) =>
                setAiSettingsForm((prev) => ({ ...prev, dataEncryptionEnabled: checked }))
              }
              label="数据加密"
              description="使用 AES-256 加密存储你的梦境内容"
            />

            <button type="submit" disabled={isLoading} className="btn btn-primary">
              {isLoading ? '保存中...' : '保存设置'}
            </button>
          </form>
        </SettingSection>
      )}

      {activeTab === 'password' && (
        <SettingSection title="修改密码" icon="🔐">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="label">当前密码</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
                placeholder="输入当前密码"
                className="input"
              />
            </div>

            <div>
              <label className="label">新密码</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                placeholder="至少 8 个字符"
                className="input"
              />
            </div>

            <div>
              <label className="label">确认新密码</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                placeholder="再次输入新密码"
                className="input"
              />
            </div>

            <button type="submit" disabled={isLoading} className="btn btn-primary">
              {isLoading ? '修改中...' : '修改密码'}
            </button>
          </form>
        </SettingSection>
      )}

      {activeTab === 'advanced' && (
        <div className="space-y-6">
          <SettingSection title="数据管理" icon="💾">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-dream-50">
                <div>
                  <h4 className="font-medium text-dream-800">导出数据</h4>
                  <p className="text-sm text-dream-500">导出所有梦境记录和分析数据</p>
                </div>
                <button className="btn btn-secondary">导出 JSON</button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-dream-50">
                <div>
                  <h4 className="font-medium text-dream-800">清除缓存</h4>
                  <p className="text-sm text-dream-500">清除本地缓存数据</p>
                </div>
                <button
                  onClick={() => {
                    localStorage.clear();
                    logout();
                    window.location.reload();
                  }}
                  className="btn btn-secondary"
                >
                  清除缓存
                </button>
              </div>
            </div>
          </SettingSection>

          <SettingSection title="危险区域" icon="⚠️">
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <h4 className="font-medium text-red-800 mb-2">删除账户</h4>
              <p className="text-sm text-red-600 mb-4">
                一旦删除账户，所有数据将永久无法恢复。这包括：
              </p>
              <ul className="text-sm text-red-600 space-y-1 mb-4">
                <li>• 所有梦境记录</li>
                <li>• 所有 AI 分析结果</li>
                <li>• 所有标签和设置</li>
                <li>• 账户信息</li>
              </ul>
              <button className="btn btn-danger">永久删除账户</button>
            </div>
          </SettingSection>
        </div>
      )}

      <div className="text-center text-sm text-dream-400 py-4">
        <p>SomniMap v1.0.0</p>
        <p className="mt-1">
          你的梦境，只属于你自己 🌙
        </p>
      </div>
    </div>
  );
};
