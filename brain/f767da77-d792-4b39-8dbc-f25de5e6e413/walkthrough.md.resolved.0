# Walkthrough - Fix Git Not Recognized Issue

I have successfully added the Portable Git path to your user environment variables. This resolve the issue where the `git` command was not recognized in your terminal.

## Changes Made

- **Environment Variable Update**: Added `C:\Users\Mohammed\Downloads\PortableGit\cmd` to the **User PATH** environment variable.
- **Verification**: Confirmed the update in the Windows Registry (HKCU:\Environment).

## How to Verify
To verify the fix yourself, please follow these steps:

1. **Close all existing terminal windows** (Command Prompt, PowerShell, VS Code terminal).
2. **Open a NEW terminal window**.
3. Type the following command and press Enter:
   ```bash
   git --version
   ```
4. You should see an output like `git version 2.53.0.windows.2`.

> [!IMPORTANT]
> The changes will only take effect in **NEW** terminal windows. Any terminal that was open before this change will still not recognize Git.

## Next Steps
Now that Git is working, you can proceed with any git operations (cloning, pulling, etc.) required for the ICS Border System migration.
