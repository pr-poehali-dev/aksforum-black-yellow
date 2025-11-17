import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type ComplaintStatus = 'pending' | 'resolved' | 'rejected';

interface Complaint {
  id: number;
  playerNickname: string;
  server: string;
  title: string;
  description: string;
  imageUrl?: string;
  status: ComplaintStatus;
  adminResponse?: string;
  createdAt: string;
}

interface PlayerData {
  nickname: string;
  server: string;
}

const ADMIN_CODE = '727372894819483-38';

const Index = () => {
  const [userRole, setUserRole] = useState<'player' | 'admin' | null>(null);
  const [playerData, setPlayerData] = useState<PlayerData>({ nickname: '', server: '' });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: 1,
      playerNickname: 'ProGamer123',
      server: 'EU-1',
      title: 'Читер на сервере',
      description: 'Игрок использует аимбот и валлхак',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      playerNickname: 'WarriorX',
      server: 'RU-2',
      title: 'Багоюз',
      description: 'Игрок использует баг с бесконечными патронами',
      status: 'resolved',
      adminResponse: 'Игрок забанен на 30 дней',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    description: '',
    imageUrl: '',
  });
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handlePlayerLogin = () => {
    if (!playerData.nickname || !playerData.server) {
      toast.error('Заполните все поля!');
      return;
    }
    setIsAuthenticated(true);
    toast.success(`Добро пожаловать, ${playerData.nickname}!`);
  };

  const handleAdminLogin = () => {
    if (adminCode === ADMIN_CODE) {
      setIsAuthenticated(true);
      toast.success('Вход в админ-панель выполнен');
    } else {
      toast.error('Неверный код доступа!');
    }
  };

  const handleCreateComplaint = () => {
    if (!newComplaint.title || !newComplaint.description) {
      toast.error('Заполните все обязательные поля!');
      return;
    }

    const complaint: Complaint = {
      id: Date.now(),
      playerNickname: playerData.nickname,
      server: playerData.server,
      title: newComplaint.title,
      description: newComplaint.description,
      imageUrl: newComplaint.imageUrl || undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setComplaints([complaint, ...complaints]);
    setNewComplaint({ title: '', description: '', imageUrl: '' });
    setIsCreateDialogOpen(false);
    toast.success('Жалоба опубликована!');
  };

  const handleDeleteComplaint = (id: number) => {
    setComplaints(complaints.filter((c) => c.id !== id));
    toast.success('Жалоба удалена');
  };

  const handleUpdateStatus = (id: number, status: ComplaintStatus) => {
    setComplaints(complaints.map((c) => (c.id === id ? { ...c, status } : c)));
    toast.success('Статус обновлен');
  };

  const handleAdminResponse = (id: number, response: string) => {
    setComplaints(complaints.map((c) => (c.id === id ? { ...c, adminResponse: response } : c)));
    toast.success('Ответ отправлен');
  };

  const getStatusBadge = (status: ComplaintStatus) => {
    const statusConfig = {
      pending: { label: 'Не решено', variant: 'default' as const },
      resolved: { label: 'Решено', variant: 'default' as const },
      rejected: { label: 'Отклонено', variant: 'destructive' as const },
    };
    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={status === 'resolved' ? 'bg-green-600' : ''}>
        {config.label}
      </Badge>
    );
  };

  if (!userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-black via-zinc-900 to-black">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center">
            <img 
              src="https://cdn.poehali.dev/files/ae91bf19-82c7-4ac5-8c61-ffb2f089d047.jpg" 
              alt="AKSGOD Logo" 
              className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-primary shadow-2xl"
            />
            <h1 className="text-5xl font-bold text-primary mb-2 tracking-wider">AKSGOD</h1>
            <p className="text-muted-foreground text-lg">Форум игроков</p>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Выберите роль</CardTitle>
              <CardDescription className="text-center">Войдите как игрок или администратор</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                onClick={() => setUserRole('player')} 
                className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Icon name="Gamepad2" className="mr-2" size={24} />
                Игрок
              </Button>
              <Button 
                onClick={() => setUserRole('admin')} 
                variant="outline" 
                className="w-full h-12 text-lg font-semibold border-2 border-primary text-primary hover:bg-primary/10"
              >
                <Icon name="ShieldCheck" className="mr-2" size={24} />
                Администратор
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-black via-zinc-900 to-black">
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-2 border-primary/20 animate-scale-in">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              {userRole === 'player' ? (
                <>
                  <Icon name="Gamepad2" className="text-primary" size={28} />
                  Вход игрока
                </>
              ) : (
                <>
                  <Icon name="ShieldCheck" className="text-primary" size={28} />
                  Вход администратора
                </>
              )}
            </CardTitle>
            <CardDescription>
              {userRole === 'player' 
                ? 'Укажите ваши игровые данные' 
                : 'Введите код доступа администратора'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userRole === 'player' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="nickname">Игровой никнейм</Label>
                  <Input
                    id="nickname"
                    placeholder="Введите ваш ник"
                    value={playerData.nickname}
                    onChange={(e) => setPlayerData({ ...playerData, nickname: e.target.value })}
                    className="bg-input border-primary/30 focus:border-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="server">Сервер</Label>
                  <Select onValueChange={(value) => setPlayerData({ ...playerData, server: value })}>
                    <SelectTrigger className="bg-input border-primary/30 focus:border-primary">
                      <SelectValue placeholder="Выберите сервер" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EU-1">EU-1</SelectItem>
                      <SelectItem value="EU-2">EU-2</SelectItem>
                      <SelectItem value="RU-1">RU-1</SelectItem>
                      <SelectItem value="RU-2">RU-2</SelectItem>
                      <SelectItem value="US-1">US-1</SelectItem>
                      <SelectItem value="US-2">US-2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handlePlayerLogin} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Войти
                </Button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="admin-code">Код доступа</Label>
                  <Input
                    id="admin-code"
                    type="password"
                    placeholder="Введите код"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    className="bg-input border-primary/30 focus:border-primary"
                  />
                </div>
                <Button onClick={handleAdminLogin} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Войти
                </Button>
              </>
            )}
            <Button 
              onClick={() => { setUserRole(null); setPlayerData({ nickname: '', server: '' }); setAdminCode(''); }} 
              variant="ghost" 
              className="w-full"
            >
              Назад
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (userRole === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8 pt-4">
            <div className="flex items-center gap-4">
              <img 
                src="https://cdn.poehali.dev/files/ae91bf19-82c7-4ac5-8c61-ffb2f089d047.jpg" 
                alt="AKSGOD" 
                className="w-16 h-16 rounded-full border-2 border-primary"
              />
              <div>
                <h1 className="text-4xl font-bold text-primary">Админ-панель</h1>
                <p className="text-muted-foreground">Управление жалобами игроков</p>
              </div>
            </div>
            <Button 
              onClick={() => { setIsAuthenticated(false); setUserRole(null); }} 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary/10"
            >
              <Icon name="LogOut" className="mr-2" size={18} />
              Выйти
            </Button>
          </div>

          <div className="grid gap-4">
            {complaints.map((complaint) => (
              <Card key={complaint.id} className="bg-card/50 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/40 transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-xl">{complaint.title}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-2 text-sm">
                          <Icon name="User" size={16} />
                          {complaint.playerNickname}
                          <span className="text-muted-foreground">•</span>
                          <Icon name="Server" size={16} />
                          {complaint.server}
                          <span className="text-muted-foreground">•</span>
                          {new Date(complaint.createdAt).toLocaleDateString('ru-RU')}
                        </div>
                      </CardDescription>
                    </div>
                    {getStatusBadge(complaint.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-foreground">{complaint.description}</p>
                  {complaint.imageUrl && (
                    <img src={complaint.imageUrl} alt="Доказательство" className="rounded-lg max-h-64 object-cover" />
                  )}
                  
                  {complaint.adminResponse && (
                    <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                      <p className="text-sm font-semibold text-primary mb-1">Ответ администратора:</p>
                      <p className="text-sm">{complaint.adminResponse}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 pt-2">
                    <Select onValueChange={(value) => handleUpdateStatus(complaint.id, value as ComplaintStatus)}>
                      <SelectTrigger className="w-48 bg-input border-primary/30">
                        <SelectValue placeholder="Изменить статус" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Не решено</SelectItem>
                        <SelectItem value="resolved">Решено</SelectItem>
                        <SelectItem value="rejected">Отклонено</SelectItem>
                      </SelectContent>
                    </Select>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                          <Icon name="MessageSquare" className="mr-2" size={18} />
                          Ответить
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-2 border-primary/20">
                        <DialogHeader>
                          <DialogTitle>Ответ на жалобу</DialogTitle>
                          <DialogDescription>Напишите ответ игроку</DialogDescription>
                        </DialogHeader>
                        <Textarea 
                          placeholder="Ваш ответ..."
                          className="bg-input border-primary/30"
                          onChange={(e) => {
                            const response = e.target.value;
                            if (response) handleAdminResponse(complaint.id, response);
                          }}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 pt-4">
          <div className="flex items-center gap-4">
            <img 
              src="https://cdn.poehali.dev/files/ae91bf19-82c7-4ac5-8c61-ffb2f089d047.jpg" 
              alt="AKSGOD" 
              className="w-16 h-16 rounded-full border-2 border-primary"
            />
            <div>
              <h1 className="text-4xl font-bold text-primary">Форум AKSGOD</h1>
              <p className="text-muted-foreground">
                {playerData.nickname} • {playerData.server}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Icon name="Plus" className="mr-2" size={18} />
                  Создать жалобу
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-2 border-primary/20 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Новая жалоба</DialogTitle>
                  <DialogDescription>Опишите проблему и приложите доказательства</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="complaint-title">Заголовок жалобы</Label>
                    <Input
                      id="complaint-title"
                      placeholder="Кратко опишите проблему"
                      value={newComplaint.title}
                      onChange={(e) => setNewComplaint({ ...newComplaint, title: e.target.value })}
                      className="bg-input border-primary/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complaint-description">Описание</Label>
                    <Textarea
                      id="complaint-description"
                      placeholder="Подробное описание ситуации..."
                      value={newComplaint.description}
                      onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                      className="bg-input border-primary/30 min-h-32"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complaint-image">URL изображения (доказательство)</Label>
                    <Input
                      id="complaint-image"
                      placeholder="https://example.com/screenshot.png"
                      value={newComplaint.imageUrl}
                      onChange={(e) => setNewComplaint({ ...newComplaint, imageUrl: e.target.value })}
                      className="bg-input border-primary/30"
                    />
                  </div>
                  <Button onClick={handleCreateComplaint} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    Опубликовать жалобу
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button 
              onClick={() => { setIsAuthenticated(false); setUserRole(null); setPlayerData({ nickname: '', server: '' }); }} 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary/10"
            >
              <Icon name="LogOut" className="mr-2" size={18} />
              Выйти
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {complaints.map((complaint) => (
            <Card key={complaint.id} className="bg-card/50 backdrop-blur-sm border-2 border-primary/20 hover:border-primary/40 transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{complaint.title}</CardTitle>
                    <CardDescription>
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="User" size={16} />
                        {complaint.playerNickname}
                        <span className="text-muted-foreground">•</span>
                        <Icon name="Server" size={16} />
                        {complaint.server}
                        <span className="text-muted-foreground">•</span>
                        {new Date(complaint.createdAt).toLocaleDateString('ru-RU')}
                      </div>
                    </CardDescription>
                  </div>
                  {getStatusBadge(complaint.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground">{complaint.description}</p>
                {complaint.imageUrl && (
                  <img src={complaint.imageUrl} alt="Доказательство" className="rounded-lg max-h-64 object-cover border border-primary/20" />
                )}
                
                {complaint.adminResponse && (
                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
                    <p className="text-sm font-semibold text-primary mb-1">Ответ администратора:</p>
                    <p className="text-sm">{complaint.adminResponse}</p>
                  </div>
                )}

                {complaint.playerNickname === playerData.nickname && (
                  <Button 
                    onClick={() => handleDeleteComplaint(complaint.id)} 
                    variant="destructive" 
                    size="sm"
                    className="mt-2"
                  >
                    <Icon name="Trash2" className="mr-2" size={16} />
                    Удалить жалобу
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
