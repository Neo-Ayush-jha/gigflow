import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Bid, getUserById } from '@/data/mockData';
import { Clock, DollarSign, Star, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BidCardProps {
  bid: Bid;
  isOwner?: boolean;
  onHire?: (bidId: string) => void;
}

const BidCard = ({ bid, isOwner = false, onHire }: BidCardProps) => {
  const freelancer = getUserById(bid.freelancerId);

  const statusColors = {
    pending: 'bg-muted text-muted-foreground',
    hired: 'bg-primary/10 text-primary',
    rejected: 'bg-destructive/10 text-destructive',
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-card">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 border-2 border-primary/10">
            <AvatarImage src={freelancer?.avatar} />
            <AvatarFallback>{freelancer?.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{freelancer?.name}</h4>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    {freelancer?.rating}
                  </span>
                  <span>{freelancer?.completedJobs} jobs completed</span>
                </div>
              </div>
              <Badge className={statusColors[bid.status]}>
                {bid.status === 'hired' && <CheckCircle className="mr-1 h-3 w-3" />}
                {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">{bid.message}</p>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1.5 rounded-md bg-primary/5 px-3 py-1.5">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="font-semibold text-primary">${bid.amount}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Delivery in {bid.deliveryDays} days</span>
              </div>
              <span className="text-xs text-muted-foreground">
                Submitted {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}
              </span>
            </div>

            {isOwner && bid.status === 'pending' && (
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={() => onHire?.(bid.id)}>
                  Hire Freelancer
                </Button>
                <Button size="sm" variant="outline">
                  Message
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BidCard;
