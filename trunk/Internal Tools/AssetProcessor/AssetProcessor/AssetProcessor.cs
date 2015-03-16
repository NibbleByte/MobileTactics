using System;
using System.Collections.Generic;
using System.IO;

using System.Drawing;
using System.Diagnostics;
using System.Runtime.InteropServices;

namespace AssetProcessor
{
	public static class AssetProcessor
	{
		public enum ScaleAction
		{
			Multiply,
			Divide,
		}

		[DllImport("kernel32.dll")]
		static extern bool CreateSymbolicLink(string lpSymlinkFileName, string lpTargetFileName, SymbolicLink dwFlags);

		enum SymbolicLink
		{
			File = 0,
			Directory = 1
		}


		public static bool ValidateFolders()
		{
			string dir = Directory.GetCurrentDirectory();
			return Directory.Exists(dir + @"\1.0") &&
				Directory.Exists(dir + @"\2.0") &&
				Directory.Exists(dir + @"\3.0") &&
				//Directory.Exists(dir + @"\Static") &&
				//Directory.Exists(dir + @"\_PublicAssets_");
				Directory.Exists(dir + @"\_Client");
		}

		public static int Scale(string inputName, string outputName, float multiplier, ScaleAction action)
		{
			int errors = 0;

			string inputFolder = Directory.GetCurrentDirectory() + @"\" + inputName;
			List<string> files = new List<string>();
			files.AddRange(Directory.GetFiles(inputFolder, "*.png", SearchOption.AllDirectories));
			files.AddRange(Directory.GetFiles(inputFolder, "*.jpg", SearchOption.AllDirectories));

			File.Delete("nconvert.log");

			foreach (string file in files)
			{
				string filename = Path.GetFileName(file);

				Bitmap image = new Bitmap(file);

				// Find out new size and check for problems.
				float scaledWidth;
				float scaledHeight;
				if (action == ScaleAction.Multiply)
				{
					scaledWidth = (image.Width) * multiplier;
					scaledHeight = image.Height * multiplier;
				}
				else
				{
					scaledWidth = image.Width / multiplier;
					scaledHeight = image.Height / multiplier;
				}
				
				if (scaledWidth != (int)scaledWidth || scaledHeight != (int)scaledHeight)
				{
					Log(string.Format("ERROR: Scaled sizes are not exact for: {0}\nOriginal size: {1}x{2}  Scaled size: {3}x{4}", file.Replace(Directory.GetCurrentDirectory() + @"\", ""), image.Width, image.Height, scaledWidth, scaledHeight), ConsoleColor.Red);
					errors++;

					scaledWidth = (int) Math.Round(scaledWidth);
					scaledHeight = (int)Math.Round(scaledHeight);
				}

				string outFile = file.Replace(inputName, outputName);
				Directory.CreateDirectory(Path.GetDirectoryName(outFile));


				// The AForge way!
				// Create filter and apply.
				//var filter = new ResizeBilinear((int) Math.Round(scaledWidth), (int) Math.Round(scaledHeight));
				//Bitmap scaledImage = filter.Apply(image);
				//scaledImage.Save(outFile);
				//Console.WriteLine("File: {0} {1}x{2}", outFile.Replace(Directory.GetCurrentDirectory() + @"\", ""), scaledImage.Width, scaledImage.Height);


				// The nconvert way!
				// Note the "-rtype quick" argument.
				// Any other resize filter won't resize the image IF it is using a palette for colors (indexed).
				// Because that would require to create new colors outside the palette.
				Process nconvert = new Process();
				nconvert.StartInfo = new ProcessStartInfo("nconvert.exe", string.Format("-o \"{0}\" -resize {1} {2} -rtype quick -overwrite \"{3}\"", outFile, scaledWidth, scaledHeight, file));
				nconvert.StartInfo.UseShellExecute = false;
				nconvert.StartInfo.RedirectStandardOutput = true;
				nconvert.StartInfo.RedirectStandardError = true;
				nconvert.Start();


				string output = nconvert.StandardError.ReadToEnd();
				File.AppendAllText("nconvert.log", output);

				nconvert.WaitForExit();

				Console.WriteLine("File: {0} {1}x{2}", outFile.Replace(Directory.GetCurrentDirectory() + @"\", ""), scaledWidth, scaledHeight);

				LogNConvertProblems("Warning", output, ConsoleColor.DarkYellow);
				if (LogNConvertProblems("Error", output, ConsoleColor.Red)) errors++;
			}

			return errors;
		}

		public static int Deploy(string deployName, bool symbolicLink = false)
		{
			int errors = 0;

			// Old way -> copy all files into Assets.
			//try
			//{
			//	DirectoryCopy(deployName, "_PublicAssets_", true, true, symbolicLink, (file) => {
			//		Console.WriteLine(file.FullName.Replace(Directory.GetCurrentDirectory() + @"\", "")); 
			//	});
			//}
			//catch (System.Exception ex)
			//{
			//	Log(ex.GetType() + ": " + ex.Message, ConsoleColor.Red);
			//	errors++;
			//}

			string deployDir = Path.Combine(Directory.GetCurrentDirectory(), deployName);
			string deployLink = Path.Combine(Directory.GetCurrentDirectory(), "_Client/Assets-Scaled");

			if (Directory.Exists(deployLink))
				Directory.Delete(deployLink);

			bool success = CreateSymbolicLink(deployLink, deployDir, SymbolicLink.Directory);

			if (!success)
			{
				Log("Could not create symbolic link. Try running as administrator.", ConsoleColor.Red);
				errors++;
			}

			return errors;
		}

		private static void DirectoryCopy(string sourceDirName, string destDirName, bool copySubDirs, bool overwrite, bool symbolicLink = false, Action<FileInfo> fileProcessor = null)
		{
			// Get the subdirectories for the specified directory.
			DirectoryInfo dir = new DirectoryInfo(sourceDirName);

			if (!dir.Exists)
			{
				throw new DirectoryNotFoundException(
					"Source directory does not exist or could not be found: "
					+ sourceDirName);
			}


			// If the destination directory doesn't exist, create it. 
			if (!Directory.Exists(destDirName))
			{
				Directory.CreateDirectory(destDirName);
			}

			// Get the files in the directory and copy them to the new location.
			FileInfo[] files = dir.GetFiles();
			foreach (FileInfo file in files)
			{
				string temppath = Path.Combine(destDirName, file.Name);

				if (symbolicLink)
				{
					if (overwrite)
						File.Delete(temppath);

					CreateSymbolicLink(temppath, file.FullName, SymbolicLink.File);
				}
				else
				{
					file.CopyTo(temppath, overwrite);
				}

				if (fileProcessor != null)
				{
					fileProcessor(file);
				}
			}

			// If copying subdirectories, copy them and their contents to new location. 
			if (copySubDirs)
			{
				DirectoryInfo[] dirs = dir.GetDirectories();

				foreach (DirectoryInfo subdir in dirs)
				{
					string temppath = Path.Combine(destDirName, subdir.Name);

					if (symbolicLink)
					{
						if (overwrite && Directory.Exists(temppath))
							Directory.Delete(temppath);

						CreateSymbolicLink(temppath, subdir.FullName, SymbolicLink.Directory);
					}
					else
					{
						DirectoryCopy(subdir.FullName, temppath, copySubDirs, overwrite, symbolicLink, fileProcessor);
					}
				}
			}
		}



		private static void Log(string message, ConsoleColor color) {
			
			ConsoleColor origColor = Console.ForegroundColor;
			Console.ForegroundColor = color;

			Console.WriteLine(message);

			Console.ForegroundColor = origColor;
		}

		private static bool LogNConvertProblems(string match, string output, ConsoleColor color)
		{
			// Show warnings and errors
			if (output.IndexOf(match, StringComparison.OrdinalIgnoreCase) > -1)
			{
				string[] arr = output.Split('\n');
				string found = Array.Find(arr, str => str.IndexOf(match, StringComparison.OrdinalIgnoreCase) > -1);
				Log(found, color);

				return true;
			}

			return false;
		}
	}
}
