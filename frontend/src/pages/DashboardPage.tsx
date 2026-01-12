import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { gigs, bids, getGigById, getUserById, getGigsByClientId, getBidsByFreelancerId } from '@/data/mockData';
import { 
  Briefcase, DollarSign, Star, TrendingUp, Clock, 
  CheckCircle, AlertCircle, PlusCircle, MessageSquare 
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('my-gigs');

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

  const myGigs = getGigsByClientId(user.id);
  const myBids = getBidsByFreelancerId(user.id);

  const stats = [
    { label: 'Active Gigs', value: myGigs.filter(g => g.status === 'open').length, icon: Briefcase, color: 'text-primary' },
    { label: 'Pending Bids', value: myBids.filter(b => b.status === 'pending').length, icon: Clock, color: 'text-accent' },
    { label: 'Hired', value: myBids.filter(b => b.status === 'hired').length, icon: CheckCircle, color: 'text-primary' },
    { label: 'Total Earnings', value: '$2,450', icon: DollarSign, color: 'text-primary' },
  ];

  const statusColors = {
    open: 'bg-primary/10 text-primary',
    assigned: 'bg-accent/10 text-accent',
    completed: 'bg-muted text-muted-foreground',
    pending: 'bg-muted text-muted-foreground',
    hired: 'bg-primary/10 text-primary',
    rejected: 'bg-destructive/10 text-destructive',
  };

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user.name.split(' ')[0]}!</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Star className="h-4 w-4 fill-accent text-accent" />
                <span>{user.rating} rating</span>
                <span>•</span>
                <span>{user.completedJobs} jobs completed</span>
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
                <Card key={gig.id} className="shadow-card transition-all hover:shadow-card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[gig.status]}>
                            {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                          </Badge>
                          <Badge variant="outline">{gig.category}</Badge>
                        </div>
                        <Link to={`/gigs/${gig.id}`}>
                          <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                            {gig.title}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {gig.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ${gig.budget.min} - ${gig.budget.max}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            {gig.bidsCount} bids
                          </span>
                        </div>
                      </div>
                      <Link to={`/gigs/${gig.id}`}>
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
                const gig = getGigById(bid.gigId);
                const client = gig ? getUserById(gig.clientId) : null;
                
                return (
                  <Card key={bid.id} className="shadow-card transition-all hover:shadow-card-hover">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className={statusColors[bid.status]}>
                              {bid.status === 'hired' && <CheckCircle className="mr-1 h-3 w-3" />}
                              {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                            </Badge>
                          </div>
                          <Link to={`/gigs/${bid.gigId}`}>
                            <h3 className="text-lg font-semibold hover:text-primary transition-colors">
                              {gig?.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={client?.avatar} />
                              <AvatarFallback>{client?.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-muted-foreground">
                              Client: {client?.name}
                            </span>
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
                        <Link to={`/gigs/${bid.gigId}`}>
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
