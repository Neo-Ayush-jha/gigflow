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
import { 
  ArrowLeft, Calendar, Clock, DollarSign, MessageSquare, 
  Send, CheckCircle, AlertCircle, Loader2 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const GigDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  const [gig, setGig] = useState<Gig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchGig = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await gigApi.getGigById(id);
        setGig(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch gig');
      } finally {
        setLoading(false);
      }
    };

    fetchGig();
  }, [id]);

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
                  Bids
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="py-8 text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">No bids yet. Be the first to bid!</p>
                </div>
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
