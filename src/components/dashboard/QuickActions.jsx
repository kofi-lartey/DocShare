import { Link } from 'react-router-dom';
import { FiUploadCloud, FiShare2, FiPlus } from 'react-icons/fi';
import Button from '../common/Button';
import { Card } from '../common/Card';

export default function QuickActions() {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
      <div className="space-y-3">
        <Link to="/dashboard/upload"><Button variant="primary" className="w-full justify-center gap-2"><FiUploadCloud size={18} />Upload Document</Button></Link>
        <Button variant="outline" className="w-full justify-center gap-2"><FiShare2 size={18} />Generate New Link</Button>
        <Link to="/dashboard/my-uploads"><Button variant="ghost" className="w-full justify-center gap-2"><FiPlus size={18} />Browse Files</Button></Link>
      </div>
    </Card>
  );
}
