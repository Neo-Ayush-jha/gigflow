import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Gig } from '@/services/api';
import { Calendar, DollarSign, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface GigCardProps {
  gig: Gig;
}

const GigCard = ({ gig }: GigCardProps) => {
  const statusColors = {
    open: 'bg-primary/10 text-primary border-primary/20',
    'in-progress': 'bg-accent/10 text-accent border-accent/20',
    completed: 'bg-muted text-muted-foreground border-muted',
  };

  const client = typeof gig.clientId === 'object' ? gig.clientId : null;

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Link to={`/gigs/${gig._id}`}>
              <h3 className="font-semibold leading-tight transition-colors group-hover:text-primary line-clamp-2">
                {gig.title}
              </h3>
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline" className="text-xs">
                {gig.category}
              </Badge>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(gig.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
          <Badge className={`shrink-0 ${statusColors[gig.status]}`}>
            {gig.status.charAt(0).toUpperCase() + gig.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {gig.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {gig.skills.slice(0, 4).map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs font-normal">
              {skill}
            </Badge>
          ))}
          {gig.skills.length > 4 && (
            <Badge variant="secondary" className="text-xs font-normal">
              +{gig.skills.length - 4}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="font-semibold">
              ${gig.budget.min} - ${gig.budget.max}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t bg-muted/20 pt-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{client?.name.charAt(0).toUpperCase() || 'CL'}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">{client?.name || 'Client'}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Due {new Date(gig.deadline).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Link to={`/gigs/${gig._id}`}>
            <Button size="sm" variant="outline">
              View Details
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default GigCard;
