using System.Collections.Generic;

namespace ReusWikiDataDownload.GameClasses
{
    public class ResourceLevel
    {
        public string Name { get; set; }
        public int Level { get; set; }
        public int MaxAspects { get; set; }
        public Yield[] Yields { get; set; }
        public List<Symbiosis> Symbioses { get; set; }
        public string ResourcePrerequisite { get; set; }
        public Ability AbilityNeeded { get; internal set; }
    }
}
