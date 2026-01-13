import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { gigApi, bidApi, Gig, Bid } from '@/services/api';
import socketService from '@/services/socket';
import { useToast } from '@/hooks/use-toast';
import {
  Briefcase,
  DollarSign,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  PlusCircle,
  MessageSquare,
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('my-gigs');
  const [myGigs, setMyGigs] = useState<Gig[]>([]);
  const [myBids, setMyBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4">
        <AlertCircle className="h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Login Required</h1>
        <p className="mt-2 text-muted-foreground">Please log in to access your dashboard.</p>
        <Link to="/login">
          <Button className="mt-6">Log In</Button>
        </Link>
      </div>
    );
  }

  // Initial fetch
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const [gigsResp, bidsResp] = await Promise.all([
          gigApi.getMyGigs(),
          bidApi.getMyBids(),
        ]);
        setMyGigs(gigsResp || []);
        setMyBids(bidsResp || []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
        setError(message);
        toast({ title: 'Error', description: message, variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, toast]);

  // Live updates via Socket.IO
  useEffect(() => {
    if (!user) return;
    socketService.connect();

    const handleGigCreated = (data: { gig: Gig }) => {
      const clientId = typeof data.gig.clientId === 'object' ? data.gig.clientId?._id : data.gig.clientId;
      if (clientId === user._id) {
        setMyGigs((prev) => [data.gig, ...prev]);
      }
    };

    const handleBidCreated = (data: { bid: Bid; gigId: string }) => {
      const freelancerId = typeof data.bid.freelancerId === 'object' ? data.bid.freelancerId._id : data.bid.freelancerId;
      if (freelancerId === user._id) {
        setMyBids((prev) => [data.bid, ...prev]);
      }

      setMyGigs((prev) =>
        prev.map((gig) =>
          gig._id === data.gigId ? { ...gig, bidsCount: (gig.bidsCount || 0) + 1 } : gig
        )
      );
    };

    const handleBidHired = (data: { bidId: string; gigId: string }) => {
      setMyBids((prev) =>
        prev.map((bid) => (bid._id === data.bidId ? { ...bid, status: 'accepted' } : bid))
      );
    };

    const handleBidRejected = (data: { gigId: string; excludeBidId: string }) => {
      setMyBids((prev) =>
        prev.map((bid) =>
          bid.gigId === data.gigId && bid._id !== data.excludeBidId && bid.status === 'pending'
            ? { ...bid, status: 'rejected' }
            : bid
        )
      );
    };

    const handleGigStatusUpdated = (data: { gigId: string; status: string }) => {
      setMyGigs((prev) =>
        prev.map((gig) => (gig._id === data.gigId ? { ...gig, status: data.status as any } : gig))
      );
    };

    socketService.on('gig-created', handleGigCreated);
    socketService.on('bid-created', handleBidCreated);
    socketService.on('bid-hired', handleBidHired);
    socketService.on('bid-rejected', handleBidRejected);
    socketService.on('gig-status-updated', handleGigStatusUpdated);

    return () => {
      socketService.off('gig-created', handleGigCreated);
      socketService.off('bid-created', handleBidCreated);
      socketService.off('bid-hired', handleBidHired);
      socketService.off('bid-rejected', handleBidRejected);
      socketService.off('gig-status-updated', handleGigStatusUpdated);
    };
  }, [user]);

  const stats = useMemo(() => {
    return [
      {
        label: 'Active Gigs',
        value: myGigs.filter((g) => g.status === 'open' || g.status === 'in-progress').length,
        icon: Briefcase,
        color: 'text-primary',
      },
      {
        label: 'Pending Bids',
        value: myBids.filter((b) => b.status === 'pending').length,
        icon: Clock,
        color: 'text-accent',
      },
      {
        label: 'Accepted Bids',
        value: myBids.filter((b) => b.status === 'accepted').length,
        icon: CheckCircle,
        color: 'text-primary',
      },
      {
        label: 'Total Bids',
        value: myBids.length,
        icon: MessageSquare,
        color: 'text-primary',
      },
    ];
  }, [myGigs, myBids]);

  const statusColors: Record<string, string> = {
    open: 'bg-primary/10 text-primary',
    'in-progress': 'bg-accent/10 text-accent',
    completed: 'bg-muted text-muted-foreground',
    pending: 'bg-muted text-muted-foreground',
    accepted: 'bg-primary/10 text-primary',
    rejected: 'bg-destructive/10 text-destructive',
  };

  const displayRating = (user as any)?.rating ?? '—';
  const displayCompletedJobs = (user as any)?.completedJobs ?? 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h1 className="mt-4 text-2xl font-bold">Dashboard Error</h1>
        <p className="mt-2 text-muted-foreground">{error}</p>
        <Button className="mt-6" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={(user as any).avatar} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user.name.split(' ')[0]}!</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span>{displayRating} rating</span>
                <span>•</span>
                <span>{displayCompletedJobs} jobs completed</span>
              </div>
            </div>
          </div>
          <Link to="/post-gig">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Post New Gig
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="shadow-card">
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-muted ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="my-gigs" className="gap-2">
              <Briefcase className="h-4 w-4" />
              My Gigs ({myGigs.length})
            </TabsTrigger>
            <TabsTrigger value="my-bids" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              My Bids ({myBids.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-gigs" className="space-y-4">
            {myGigs.length > 0 ? (
              myGigs.map((gig) => (
                <Card key={gig._id} className="shadow-card transition-all hover:shadow-card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[gig.status] || 'bg-muted text-muted-foreground'}>
                            {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                          </Badge>
                          <Badge variant="outline">{gig.category}</Badge>
                        </div>
                        <Link to={`/gigs/${gig._id}`}>
                          <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                            {gig.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground line-clamp-1">{gig.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ${gig.budget.min} - ${gig.budget.max}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {gig.bidsCount ?? 0} bids
                          </span>
                        </div>
                      </div>
                      <Link to={`/gigs/${gig._id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="shadow-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No gigs yet</h3>
                  <p className="mt-2 text-muted-foreground">Post your first gig to start hiring freelancers.</p>
                  <Link to="/post-gig">
                    <Button className="mt-6 gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Post a Gig
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my-bids" className="space-y-4">
            {myBids.length > 0 ? (
              myBids.map((bid) => {
                const gigRef = typeof bid.gigId === 'object' ? bid.gigId : null;
                const gigId = gigRef?._id || (bid.gigId as string);
                const gigTitle = gigRef?.title || 'Gig';
                const clientName = gigRef && typeof gigRef.clientId === 'object' ? gigRef.clientId.name : 'Client';
                const clientAvatar = gigRef && typeof gigRef.clientId === 'object' ? (gigRef.clientId as any).avatar : undefined;

                return (
                  <Card key={bid._id} className="shadow-card transition-all hover:shadow-card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className={statusColors[bid.status]}>
                              {bid.status === 'accepted' && <CheckCircle className="mr-1 h-3 w-3" />}
                              {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                            </Badge>
                          </div>
                          <Link to={`/gigs/${gigId}`}>
                            <h3 className="text-lg font-semibold hover:text-primary transition-colors">{gigTitle}</h3>
                          </Link>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={clientAvatar} />
                              <AvatarFallback>{clientName.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">Client: {clientName}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1 font-semibold text-primary">
                              <DollarSign className="h-4 w-4" />
                              Your bid: ${bid.amount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {bid.deliveryDays} days delivery
                            </span>
                          </div>
                        </div>
                        <Link to={`/gigs/${gigId}`}>
                          <Button variant="outline" size="sm">
                            View Gig
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="shadow-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No bids yet</h3>
                  <p className="mt-2 text-muted-foreground">Start bidding on gigs to grow your freelance career.</p>
                  <Link to="/gigs">
                    <Button className="mt-6 gap-2">Browse Gigs</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DashboardPage;