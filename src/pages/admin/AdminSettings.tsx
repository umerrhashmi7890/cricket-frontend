import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Clock, Bell, CreditCard, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminSettings = () => {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Configure your booking system preferences</p>
        </div>
        <Button variant="default">
          <Save className="w-4 h-4" />
          Save All Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operating Hours */}
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Operating Hours</h2>
              <p className="text-sm text-muted-foreground">Set your facility's operating hours</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Opening Time</Label>
                <Select defaultValue="09:00">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                        {i > 12 ? i - 12 : i === 0 ? 12 : i}:00 {i >= 12 ? 'PM' : 'AM'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Closing Time</Label>
                <Select defaultValue="04:00">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                        {i > 12 ? i - 12 : i === 0 ? 12 : i}:00 {i >= 12 ? 'PM' : 'AM'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-t">
              <div>
                <p className="font-medium text-foreground">24/7 Operation</p>
                <p className="text-sm text-muted-foreground">Enable round-the-clock booking</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Notifications</h2>
              <p className="text-sm text-muted-foreground">Configure notification preferences</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-foreground">SMS Notifications</p>
                <p className="text-sm text-muted-foreground">Send booking confirmations via SMS</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-3 border-t">
              <div>
                <p className="font-medium text-foreground">WhatsApp Notifications</p>
                <p className="text-sm text-muted-foreground">Send updates via WhatsApp</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-3 border-t">
              <div>
                <p className="font-medium text-foreground">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Send email confirmations</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between py-3 border-t">
              <div>
                <p className="font-medium text-foreground">Admin Alerts</p>
                <p className="text-sm text-muted-foreground">Receive alerts for new bookings</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Payment Gateway</h2>
              <p className="text-sm text-muted-foreground">Configure payment processing</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label>Payment Provider</Label>
              <Select defaultValue="moyasar">
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="moyasar">Moyasar</SelectItem>
                  <SelectItem value="tap">Tap Payments</SelectItem>
                  <SelectItem value="hyperpay">HyperPay</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>API Key</Label>
              <Input type="password" defaultValue="sk_live_xxxxxxxxxxxxx" className="mt-1 font-mono" />
            </div>
            <div>
              <Label>Secret Key</Label>
              <Input type="password" defaultValue="pk_live_xxxxxxxxxxxxx" className="mt-1 font-mono" />
            </div>
            <div className="flex items-center justify-between py-3 border-t">
              <div>
                <p className="font-medium text-foreground">Test Mode</p>
                <p className="text-sm text-muted-foreground">Use sandbox environment</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* VAT Settings */}
        <div className="bg-card rounded-xl border p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">VAT Settings</h2>
              <p className="text-sm text-muted-foreground">Configure tax settings</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-foreground">VAT Registration Status</span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  Not Registered
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                You are not currently registered for VAT. All prices shown are final prices.
              </p>
            </div>
            <div>
              <Label>VAT Number (Optional)</Label>
              <Input placeholder="Enter VAT registration number" className="mt-1" />
            </div>
            <div className="flex items-center justify-between py-3 border-t">
              <div>
                <p className="font-medium text-foreground">Enable VAT</p>
                <p className="text-sm text-muted-foreground">Add 15% VAT to all bookings</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-6 bg-destructive/5 border border-destructive/20 rounded-xl p-6">
        <h2 className="font-semibold text-destructive mb-2">Danger Zone</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Irreversible and destructive actions. Please be careful.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
            Reset All Settings
          </Button>
          <Button variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
            Clear All Bookings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
