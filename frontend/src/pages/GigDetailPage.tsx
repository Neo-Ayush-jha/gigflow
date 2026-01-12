import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import BidCard from '@/components/gigs/BidCard';
import { getGigById, getBidsByGigId, getUserById } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  ArrowLeft, Calendar, Clock, DollarSign, MessageSquare, 
  Send, Star, CheckCircle, AlertCircle 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const GigDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const gig = getGigById(id || '');
  const bids = getBidsByGigId(id || '');
  const client = gig ? getUserById(gig.clientId) : null;

  if (!gig) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4">
        <AlertCircle className="h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Gig Not Found</h1>
        <p className="mt-2 text-muted-foreground">This gig doesn't exist or has been removed.</p>
        <Link to="/gigs">
          <Button className="mt-6">Browse Gigs</Button>
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === gig.clientId;
  const hasAlreadyBid = bids.some(b => b.freelancerId === user?.id);

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please log in to submit a bid.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Bid Submitted!',
      description: 'Your bid has been submitted successfully.',
    });
    
    setBidAmount('');
    setBidMessage('');
    setDeliveryDays('');
    setIsSubmitting(false);
  };

  const handleHire = (bidId: string) => {
    toast({
      title: 'Freelancer Hired!',
      description: 'The freelancer has been notified and will start working on your project.',
    });
  };

  const statusColors = {
    open: 'bg-primary/10 text-primary border-primary/20',
    assigned: 'bg-accent/10 text-accent border-accent/20',
    completed: 'bg-muted text-muted-foreground border-muted',
  };

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="container mx-auto px-4">
        <Link to="/gigs" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Gigs
        </Link>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gig Details */}
            <Card className="shadow-card">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Badge className={statusColors[gig.status]}>
                      {gig.status === 'assigned' && <CheckCircle className="mr-1 h-3 w-3" />}
                      {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                    </Badge>
                    <CardTitle className="text-2xl">{gig.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Posted {formatDistanceToNow(new Date(gig.createdAt), { addSuffix: true })}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {gig.bidsCount} bids
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="text-2xl font-bold text-primary">
                      ${gig.budget.min} - ${gig.budget.max}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="mb-2 font-semibold">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-line">{gig.description}</p>
                </div>

                <div>
                  <h3 className="mb-3 font-semibold">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {gig.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-6 rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Deadline</p>
                      <p className="font-medium">{new Date(gig.deadline).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{gig.category}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bids Section */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Bids ({bids.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {bids.length > 0 ? (
                  bids.map((bid) => (
                    <BidCard 
                      key={bid.id} 
                      bid={bid} 
                      isOwner={isOwner} 
                      onHire={handleHire}
                    />
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">No bids yet. Be the first to bid!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Client Info */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">About the Client</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/10">
                    <AvatarImage src={client?.avatar} />
                    <AvatarFallback>{client?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{client?.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-accent text-accent" />
                      <span>{client?.rating} rating</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Jobs Posted</span>
                    <span className="font-medium">{client?.completedJobs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Member since</span>
                    <span className="font-medium">
                      {new Date(client?.joinedDate || '').toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Bid */}
            {gig.status === 'open' && !isOwner && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Submit Your Bid</CardTitle>
                </CardHeader>
                <CardContent>
                  {hasAlreadyBid ? (
                    <div className="text-center py-4">
                      <CheckCircle className="mx-auto h-10 w-10 text-primary" />
                      <p className="mt-2 font-medium">You've already submitted a bid</p>
                      <p className="text-sm text-muted-foreground">Wait for the client to review your proposal.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitBid} className="space-y-4">
                      <div>
                        <Label htmlFor="amount">Your Bid Amount ($)</Label>
                        <div className="relative mt-1.5">
                          <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="amount"
                            type="number"
                            placeholder="Enter amount"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(e.target.value)}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="delivery">Delivery Time (days)</Label>
                        <Input
                          id="delivery"
                          type="number"
                          placeholder="e.g., 14"
                          value={deliveryDays}
                          onChange={(e) => setDeliveryDays(e.target.value)}
                          className="mt-1.5"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="message">Cover Letter</Label>
                        <Textarea
                          id="message"
                          placeholder="Introduce yourself and explain why you're the best fit..."
                          value={bidMessage}
                          onChange={(e) => setBidMessage(e.target.value)}
                          className="mt-1.5 min-h-[120px]"
                          required
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full gap-2" 
                        disabled={isSubmitting}
                      >
                        <Send className="h-4 w-4" />
                        {isSubmitting ? 'Submitting...' : 'Submit Bid'}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GigDetailPage;
