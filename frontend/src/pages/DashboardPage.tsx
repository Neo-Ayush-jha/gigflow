import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { gigApi, bidApi, Gig, Bid } from '@/services/api';
import socketService from '@/services/socket';
import { 
  Briefcase, DollarSign, Star, Clock, 
  CheckCircle, AlertCircle, PlusCircle, MessageSquare, Loader2
} from 'lucide-react';

const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('my-gigs');
  
  const [myGigs, setMyGigs] = useState<Gig[]>([]);
  const [myBids, setMyBids] = useState<Bid[]>([]);
  const [loadingGigs, setLoadingGigs] = useState(true);
  const [loadingBids, setLoadingBids] = useState(true);

  // Fetch user's gigs
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchMyGigs = async () => {
      try {
        setLoadingGigs(true);
        const data = await gigApi.getMyGigs();
        setMyGigs(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load your gigs',
          variant: 'destructive',
        });
      } finally {
        setLoadingGigs(false);
      }
    };

    fetchMyGigs();
  }, [isAuthenticated, toast]);

  // Fetch user's bids
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchMyBids = async () => {
      try {
        setLoadingBids(true);
        const data = await bidApi.getBidsForFreelancer();
        setMyBids(data);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load your bids',
          variant: 'destructive',
        });
      } finally {
        setLoadingBids(false);
      }
    };

    fetchMyBids();
  }, [isAuthenticated, toast]);

  // Socket.IO real-time updates
  useEffect(() => {
    if (!isAuthenticated) return;

    socketService.connect();

    // Listen for new gigs created by user
    const handleGigCreated = (data: { gig: Gig }) => {
      setMyGigs((prev) => [data.gig, ...prev]);
      toast({
        title: 'Gig Created!',
        description: data.gig.title,
      });
    };

    // Listen for gig status updates
    const handleGigStatusUpdated = (data: { gigId: string; status: string }) => {
      setMyGigs((prev) =>
        prev.map((gig) =>
          gig._id === data.gigId ? { ...gig, status: data.status as any } : gig
        )
      );
    };

    // Listen for new bid on user's gig
    const handleBidCreated = (data: { bid: Bid; gigId: string }) => {
      setMyGigs((prev) =>
        prev.map((gig) =>
          gig._id === data.gigId
            ? { ...gig, bidsCount: (gig.bidsCount || 0) + 1 }
            : gig
        )
      );
    };

    // Listen for bid status updates (hired/rejected)
    const handleBidHired = (data: { bidId: string; gigId: string; status: string }) => {
      setMyBids((prev) =>
        prev.map((bid) =>
          bid._id === data.bidId ? { ...bid, status: data.status as any } : bid
        )
      );
    };

    socketService.on('gig-created', handleGigCreated);
    socketService.on('gig-status-updated', handleGigStatusUpdated);
    socketService.on('bid-created', handleBidCreated);
    socketService.on('bid-hired', handleBidHired);

    return () => {
      socketService.off('gig-created', handleGigCreated);
      socketService.off('gig-status-updated', handleGigStatusUpdated);
      socketService.off('bid-created', handleBidCreated);
      socketService.off('bid-hired', handleBidHired);
    };
  }, [isAuthenticated, toast]);

  if (!isAuthenticated) {
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

  const stats = [
    { 
      label: 'Active Gigs', 
      value: myGigs.filter(g => g.status === 'open').length, 
      icon: Briefcase, 
      color: 'text-primary' 
    },
    { 
      label: 'Pending Bids', 
      value: myBids.filter(b => b.status === 'pending').length, 
      icon: Clock, 
      color: 'text-accent' 
    },
    { 
      label: 'Hired', 
      value: myBids.filter(b => b.status === 'accepted').length, 
      icon: CheckCircle, 
      color: 'text-green-500' 
    },
    { 
      label: 'Total Earnings', 
      value: `$${myBids
        .filter(b => b.status === 'accepted')
        .reduce((sum, bid) => sum + bid.amount, 0)}`, 
      icon: DollarSign, 
      color: 'text-primary' 
    },
  ];

  const statusColors = {
    open: 'bg-blue-500/10 text-blue-500',
    'in-progress': 'bg-yellow-500/10 text-yellow-500',
    completed: 'bg-green-500/10 text-green-500',
    pending: 'bg-yellow-500/10 text-yellow-500',
    accepted: 'bg-green-500/10 text-green-500',
    rejected: 'bg-red-500/10 text-red-500',
  };

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user?.name.split(' ')[0]}!</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span>{user?.rating || 0} rating</span>
                <span>•</span>
                <span>{user?.completedJobs || 0} jobs completed</span>
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
            {loadingGigs ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : myGigs.length > 0 ? (
              myGigs.map((gig) => (
                <Card key={gig._id} className="shadow-card transition-all hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={statusColors[gig.status]}>
                            {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                          </Badge>
                          <Badge variant="outline">{gig.category}</Badge>
                        </div>
                        <Link to={`/gigs/${gig._id}`}>
                          <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                            {gig.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {gig.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ${gig.budget.min} - ${gig.budget.max}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {gig.bidsCount || 0} bids
                          </span>
                          <span className="text-xs">
                            Posted {new Date(gig.createdAt).toLocaleDateString()}
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
            {loadingBids ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : myBids.length > 0 ? (
              myBids.map((bid) => {
                const gig = typeof bid.gigId === 'object' ? bid.gigId : null;
                const gigTitle = gig?.title || 'Loading...';
                const gigId = typeof bid.gigId === 'string' ? bid.gigId : gig?._id;
                
                return (
                  <Card key={bid._id} className="shadow-card transition-all hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={statusColors[bid.status]}>
                              {bid.status === 'accepted' && <CheckCircle className="mr-1 h-3 w-3" />}
                              {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                            </Badge>
                          </div>
                          <Link to={`/gigs/${gigId}`}>
                            <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                              {gigTitle}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1 font-semibold text-primary">
                              <DollarSign className="h-4 w-4" />
                              Your bid: ${bid.amount}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {bid.deliveryDays} days delivery
                            </span>
                            <span className="text-xs">
                              Bid placed {new Date(bid.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {bid.status === 'accepted' && (
                            <div className="mt-2 rounded-lg bg-green-500/10 p-2 text-sm text-green-600">
                              ✓ Your bid has been accepted! Start working on the project.
                            </div>
                          )}
                          {bid.status === 'rejected' && (
                            <div className="mt-2 rounded-lg bg-red-500/10 p-2 text-sm text-red-600">
                              ✕ Your bid was not selected for this gig.
                            </div>
                          )}
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
                    <Button className="mt-6 gap-2">
                      Browse Gigs
                    </Button>
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
