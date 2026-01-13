import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { gigApi, bidApi, Gig } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import socketService from '@/services/socket';
import { 
  ArrowLeft, Calendar, Clock, DollarSign, MessageSquare, 
  Send, CheckCircle, AlertCircle, Loader2, XCircle 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const GigDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [gig, setGig] = useState<Gig | null>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHiring, setIsHiring] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const fetchGigAndBids = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const [gigData, bidsData] = await Promise.all([
          gigApi.getGigById(id),
          bidApi.getBidsForGig(id),
        ]);
        setGig(gigData);
        setBids(bidsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchGigAndBids();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    socketService.connect();

    const handleNewBid = (data: { bid: any; gigId: string }) => {
      if (data.gigId === id) {
        setBids((prevBids) => [data.bid, ...prevBids]);
        
        setGig((prevGig) => 
          prevGig ? { ...prevGig, bidsCount: prevGig.bidsCount + 1 } : prevGig
        );
        
        toast({
          title: 'New Bid Received!',
          description: `${data.bid.freelancerId?.name || 'Someone'} placed a bid`,
        });
      }
    };

    const handleBidHired = (data: { bidId: string; gigId: string; status: string }) => {
      if (data.gigId === id) {
        setBids((prevBids) =>
          prevBids.map((bid) =>
            bid._id === data.bidId
              ? { ...bid, status: 'accepted' }
              : { ...bid, status: bid.status === 'pending' ? 'rejected' : bid.status }
          )
        );
        setGig((prevGig) => 
          prevGig ? { ...prevGig, status: 'in-progress' } : prevGig
        );
      }
    };

    const handleBidRejected = (data: { gigId: string; excludeBidId: string }) => {
      if (data.gigId === id) {
        setBids((prevBids) =>
          prevBids.map((bid) =>
            bid._id !== data.excludeBidId && bid.status === 'pending'
              ? { ...bid, status: 'rejected' }
              : bid
          )
        );
      }
    };

    const handleGigStatusUpdated = (data: { gigId: string; status: string }) => {
      if (data.gigId === id) {
        setGig((prevGig) => 
          prevGig ? { ...prevGig, status: data.status as any } : prevGig
        );
        toast({
          title: 'Gig Status Updated',
          description: `Gig is now ${data.status}`,
        });
      }
    };

    socketService.on('bid-created', handleNewBid);
    socketService.on('bid-hired', handleBidHired);
    socketService.on('bid-rejected', handleBidRejected);
    socketService.on('gig-status-updated', handleGigStatusUpdated);

    return () => {
      socketService.off('bid-created', handleNewBid);
      socketService.off('bid-hired', handleBidHired);
      socketService.off('bid-rejected', handleBidRejected);
      socketService.off('gig-status-updated', handleGigStatusUpdated);
    };
  }, [id, toast]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4">
        <AlertCircle className="h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">Gig Not Found</h1>
        <p className="mt-2 text-muted-foreground">{error || "This gig doesn't exist or has been removed."}</p>
        <Link to="/gigs">
          <Button className="mt-6">Browse Gigs</Button>
        </Link>
      </div>
    );
  }

  const client = typeof gig.clientId === 'object' ? gig.clientId : null;
  const clientIdString = typeof gig.clientId === 'object' ? gig.clientId._id : gig.clientId;
  const isOwner = user?._id === clientIdString;

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

    try {
      setIsSubmitting(true);
      await bidApi.placeBid({
        gigId: gig._id,
        amount: parseFloat(bidAmount),
        message: bidMessage,
        deliveryDays: parseInt(deliveryDays),
      });
      
      toast({
        title: 'Bid Submitted!',
        description: 'Your bid has been submitted successfully.',
      });
      
      setBidAmount('');
      setBidMessage('');
      setDeliveryDays('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit bid',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHireBid = async (bidId: string) => {
    try {
      setIsHiring(true);
      await bidApi.hireBid(bidId);
      
      toast({
        title: 'Bid Accepted!',
        description: 'Freelancer has been hired successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to hire freelancer',
        variant: 'destructive',
      });
    } finally {
      setIsHiring(false);
    }
  };

  const handleCloseGig = async () => {
    if (!gig) return;
    
    try {
      setIsClosing(true);
      await gigApi.updateGigStatus(gig._id, 'completed');
      
      toast({
        title: 'Gig Closed!',
        description: 'The gig has been marked as completed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to close gig',
        variant: 'destructive',
      });
    } finally {
      setIsClosing(false);
    }
  };

  const statusColors = {
    open: 'bg-primary/10 text-primary border-primary/20',
    'in-progress': 'bg-accent/10 text-accent border-accent/20',
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
                      {gig.status === 'in-progress' && <CheckCircle className="mr-1 h-3 w-3" />}
                      {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
                    </Badge>
                    <CardTitle className="text-2xl">{gig.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Posted {formatDistanceToNow(new Date(gig.createdAt), { addSuffix: true })}
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
                  bids.map((bid) => {
                    const bidder = typeof bid.freelancerId === 'object' ? bid.freelancerId : null;
                    const statusColors = {
                      pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
                      accepted: 'bg-green-500/10 text-green-500 border-green-500/20',
                      rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
                    };
                    return (
                      <div key={bid._id} className="rounded-lg border p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {bidder?.name?.charAt(0).toUpperCase() || 'B'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-semibold">{bidder?.name || 'Unknown'}</p>
                              <p className="text-sm text-muted-foreground">{bidder?.email || ''}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">${bid.amount}</p>
                            <p className="text-xs text-muted-foreground">{bid.deliveryDays} days</p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm text-muted-foreground">{bid.message}</p>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <Badge className={statusColors[bid.status]}>
                            {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                          </Badge>
                          {isOwner && bid.status === 'pending' && gig.status === 'open' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleHireBid(bid._id)}
                              disabled={isHiring}
                            >
                              {isHiring ? 'Hiring...' : 'Hire'}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })
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
                    <AvatarFallback>{client?.name.charAt(0).toUpperCase() || 'CL'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{client?.name || 'Client'}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{client?.email || 'Project Owner'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Close Gig - Only for owner */}
            {isOwner && (gig.status === 'open' || gig.status === 'in-progress') && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Manage Gig</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button 
                    variant="destructive" 
                    className="w-full gap-2"
                    onClick={handleCloseGig}
                    disabled={isClosing}
                  >
                    <XCircle className="h-4 w-4" />
                    {isClosing ? 'Closing...' : 'Close Gig'}
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Closing the gig will mark it as completed and prevent new bids.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Submit Bid */}
            {gig.status === 'open' && !isOwner && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg">Submit Your Bid</CardTitle>
                </CardHeader>
                <CardContent>
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
