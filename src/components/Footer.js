import React from 'react';

function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold mb-2 flex items-center">
              <span className="mr-2">📝</span> GrantCraft
            </h3>
            <p className="text-muted-foreground">AI-powered grant writing assistant</p>
          </div>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-6">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t text-center text-muted-foreground">
          <p>© {new Date().getFullYear()} GrantCraft. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;